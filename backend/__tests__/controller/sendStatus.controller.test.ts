import { sendStatusEmail } from '../../src/service/sendStatus.service';
import { setResponse } from '../../src/helper';
import { sendStatusRequest, resendStatusRequest } from '../../src/controller/sendStatus';
import { createStatusRecord, updatePlayerStatusRecord } from '../../src/service/statusDB.service';

import { APIGatewayProxyEvent } from 'aws-lambda';
jest.mock('../../src/service/statusDB.service', () => {
  return {
    createStatusRecord: jest.fn().mockReturnThis(),
    updatePlayerStatusRecord: jest.fn().mockReturnThis(),
  };
});

jest.mock('../../src/service/sendStatus.service', () => {
  return {
    sendStatusEmail: jest.fn().mockReturnThis(),
    sendNotifications: jest.fn(),
  };
});

const mockSendStatusEmail = sendStatusEmail as jest.Mock<any>;
const mockCreateStatusRecord = createStatusRecord as jest.Mock<any>;
const mockUpdatePlayerStatusRecord = updatePlayerStatusRecord as jest.Mock<any>;

jest.mock('aws-sdk', () => {
  const mockedSES = {
    sendBulkTemplatedEmail: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  };

  return {
    SES: jest.fn(() => mockedSES),
  };
});

describe('sendStatus', () => {
  const testValidPlayers = [
    {
      id: 'testId1',
      phoneNumber: '1234567894',
      sendEmail: true,
      sendText: true,
      email: 'testEmail@testEmail.com',
    },
    {
      id: 'testId2',
      phoneNumber: '1234567894',
      sendEmail: false,
      sendText: false,
      email: 'testEmail@testEmail.com',
    },
  ];
  const validTestTeam = {
    teamId: 'statusTeam1',
    dateTime: 'dateTimeTest',
    players: testValidPlayers,
    opponentName: 'opponentNameTest',
    teamName: 'teamNameTest',
  };

  const testAddPlayerValidPlayers = [
    {
      id: 'testAddPlayerId1',
      phoneNumber: '1234567894',
      sendEmail: true,
      sendText: true,
      email: 'testEmail@testEmail.com',
    },
    {
      id: 'testAddPlayerId2',
      phoneNumber: '1234567894',
      sendEmail: false,
      sendText: false,
      email: 'testEmail@testEmail.com',
    },
  ];

  const validAddPlayerTestTeam = {
    teamId: 'statusAddPlayerTeam1',
    gameId: 'statusAddPlayerGameId',
    dateTime: 'dateTimeTest',
    players: testAddPlayerValidPlayers,
    opponentName: 'opponentAddPlayerNameTest',
    teamName: 'teamNameAddPlayerTest',
    addPlayer: true,
  };

  const baseEvent: APIGatewayProxyEvent = {
    body: '',
    headers: {},
    httpMethod: 'GET',
    isBase64Encoded: false,
    path: '',
    pathParameters: {},
    queryStringParameters: undefined,
    stageVariables: {},
    requestContext: undefined,
    multiValueHeaders: undefined,
    multiValueQueryStringParameters: undefined,
    resource: '',
  };

  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('when sending status requests', () => {
    test('it returns status 201 when given valid inputs', async () => {
      const event = {
        ...baseEvent,
        queryStringParameters: undefined,
        body: JSON.stringify(validTestTeam),
      };
      mockSendStatusEmail.mockImplementationOnce(() => {
        return { sesReturn: '', sentEmails: testValidPlayers };
      });
      const actual = await sendStatusRequest(event);
      const expected = setResponse(201, {}, validTestTeam);
      expect(actual.statusCode).toEqual(expected.statusCode);
    });
    test('it returns status 201 when given valid inputs for adding player and call updatePlayerStatusRecord', async () => {
      const event = {
        ...baseEvent,
        queryStringParameters: undefined,
        body: JSON.stringify(validAddPlayerTestTeam),
      };
      mockSendStatusEmail.mockImplementationOnce(() => {
        return { sesReturn: '', sentEmails: testValidPlayers };
      });
      const actual = await sendStatusRequest(event);
      const expected = setResponse(201, {}, validTestTeam);
      expect(actual.statusCode).toEqual(expected.statusCode);
      expect(mockCreateStatusRecord.mock.calls).toHaveLength(0);
      expect(mockUpdatePlayerStatusRecord.mock.calls).toHaveLength(2);
      expect(mockUpdatePlayerStatusRecord.mock.calls[0][0]).toEqual({
        gameId: 'statusAddPlayerGameId',
        playerId: 'testAddPlayerId1',
        teamId: 'statusAddPlayerTeam1',
        updateField: 'players',
        updateValue: {
          email: 'testEmail@testEmail.com',
          id: 'testAddPlayerId1',
          phoneNumber: '1234567894',
          sendEmail: true,
          sendText: true,
          smsDelivered: null,
          status: null,
        },
      });
    });
    test('it returns status 400 when given inValid inputs', async () => {
      const event = { ...baseEvent, queryStringParameters: undefined, body: JSON.stringify({}) };
      mockSendStatusEmail.mockImplementationOnce(() => {
        return { sesReturn: '', sentEmails: testValidPlayers };
      });
      const actual = await sendStatusRequest(event);
      const expected = setResponse(400, {}, validTestTeam);
      expect(actual.statusCode).toEqual(expected.statusCode);
    });
    test('it returns status 500 when unable to send', async () => {
      jest.resetAllMocks();
      const event = { ...baseEvent, queryStringParameters: undefined, body: JSON.stringify(validTestTeam) };
      mockSendStatusEmail.mockImplementationOnce(() => {
        throw new Error('TestError');
      });
      const actual = await sendStatusRequest(event);
      const expected = setResponse(500, {}, validTestTeam);
      expect(actual.statusCode).toEqual(expected.statusCode);
    });
  });
  describe('when resendStatusRequest', () => {
    test('it returns status 201 when given valid inputs', async () => {
      const event = { ...baseEvent, queryStringParameters: undefined, body: JSON.stringify(validTestTeam) };
      mockSendStatusEmail.mockImplementationOnce(() => {
        return { sesReturn: '', sentEmails: testValidPlayers };
      });
      const actual = await resendStatusRequest(event);
      const expected = setResponse(201, {}, validTestTeam);
      expect(actual.statusCode).toEqual(expected.statusCode);
    });
    test('it returns status 400 when given inValid inputs', async () => {
      const event = { ...baseEvent, queryStringParameters: undefined, body: JSON.stringify({}) };
      mockSendStatusEmail.mockImplementationOnce(() => {
        return { sesReturn: '', sentEmails: testValidPlayers };
      });
      const actual = await resendStatusRequest(event);
      const expected = setResponse(400, {}, validTestTeam);
      expect(actual.statusCode).toEqual(expected.statusCode);
    });
    test('it returns status 500 when unable to send', async () => {
      jest.resetAllMocks();
      const event = { ...baseEvent, queryStringParameters: undefined, body: JSON.stringify(validTestTeam) };
      mockSendStatusEmail.mockImplementationOnce(() => {
        throw new Error('TestError');
      });
      const actual = await resendStatusRequest(event);
      const expected = setResponse(500, {}, validTestTeam);
      expect(actual.statusCode).toEqual(expected.statusCode);
    });
  });
});
