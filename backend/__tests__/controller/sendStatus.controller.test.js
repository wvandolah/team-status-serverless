const {
  createStatusRecord,
  updatePlayerStatusRecord,
  sendNotifications,
} = require('../../src/service/statusDB.service');
const { sendStatusEmail } = require('../../src/service/sendStatus.service');
const { setResponse } = require('../../src/helper');
const { sendStatusRequest, resendStatusRequest } = require('../../src/controller/sendStatus.controller');
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

jest.mock('aws-sdk', () => {
  const mockedSES = {
    sendBulkTemplatedEmail: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  };

  return {
    SES: jest.fn(() => mockedSES),
  };
});

describe('sendStatus.controller', () => {
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
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('when sending status requests', () => {
    test('it returns status 201 when given valid inputs', async () => {
      const event = { queryStringParameters: '', body: JSON.stringify(validTestTeam) };
      sendStatusEmail.mockImplementationOnce(() => {
        return { sesReturn: '', sentEmails: testValidPlayers };
      });
      const actual = await sendStatusRequest(event);
      const expected = setResponse(201, {}, validTestTeam);
      expect(actual.statusCode).toEqual(expected.statusCode);
    });
    test('it returns status 400 when given inValid inputs', async () => {
      const event = { queryStringParameters: '', body: JSON.stringify({}) };
      sendStatusEmail.mockImplementationOnce(() => {
        return { sesReturn: '', sentEmails: testValidPlayers };
      });
      const actual = await sendStatusRequest(event);
      const expected = setResponse(400, {}, validTestTeam);
      expect(actual.statusCode).toEqual(expected.statusCode);
    });
    test('it returns status 500 when unable to send', async () => {
      jest.resetAllMocks();
      const event = { queryStringParameters: '', body: JSON.stringify(validTestTeam) };
      sendStatusEmail.mockImplementationOnce(() => {
        throw new Error('TestError');
      });
      const actual = await sendStatusRequest(event);
      const expected = setResponse(500, {}, validTestTeam);
      expect(actual.statusCode).toEqual(expected.statusCode);
    });
  });
  describe('when resendStatusRequest', () => {
    test('it returns status 201 when given valid inputs', async () => {
      const event = { queryStringParameters: '', body: JSON.stringify(validTestTeam) };
      sendStatusEmail.mockImplementationOnce(() => {
        return { sesReturn: '', sentEmails: testValidPlayers };
      });
      const actual = await resendStatusRequest(event);
      const expected = setResponse(201, {}, validTestTeam);
      expect(actual.statusCode).toEqual(expected.statusCode);
    });
    test('it returns status 400 when given inValid inputs', async () => {
      const event = { queryStringParameters: '', body: JSON.stringify({}) };
      sendStatusEmail.mockImplementationOnce(() => {
        return { sesReturn: '', sentEmails: testValidPlayers };
      });
      const actual = await resendStatusRequest(event);
      const expected = setResponse(400, {}, validTestTeam);
      expect(actual.statusCode).toEqual(expected.statusCode);
    });
    test('it returns status 500 when unable to send', async () => {
      jest.resetAllMocks();
      const event = { queryStringParameters: '', body: JSON.stringify(validTestTeam) };
      sendStatusEmail.mockImplementationOnce(() => {
        throw new Error('TestError');
      });
      const actual = await resendStatusRequest(event);
      const expected = setResponse(500, {}, validTestTeam);
      expect(actual.statusCode).toEqual(expected.statusCode);
    });
  });
});
