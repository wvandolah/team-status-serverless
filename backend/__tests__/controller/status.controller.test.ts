import { searchStatus, searchStatuses, deleteStatus, updatePlayerStatus } from '../../src/controller/status';
import { searchStatusRecord, deleteStatusRecord, updatePlayerStatusRecord } from '../../src/service/statusDB.service';
import { sendDeleteEmail } from '../../src/service/sendStatus.service';
import { setResponse } from '../../src/helper';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { APIEvent, PlayerTypes, SearchStatus, SearchStatuses } from '../../../common/models';
jest.mock('../../src/service/statusDB.service', () => {
  return {
    searchStatusRecord: jest.fn().mockReturnThis(),
    deleteStatusRecord: jest.fn().mockReturnThis(),
    updatePlayerStatusRecord: jest.fn().mockReturnThis(),
  };
});

jest.mock('../../src/service/sendStatus.service', () => {
  return {
    sendDeleteSMS: jest.fn().mockReturnThis(),
    sendDeleteEmail: jest.fn().mockReturnThis(),
    sendNotifications: jest.fn().mockReturnThis(),
  };
});

const mockSearchStatusRecord = searchStatusRecord as jest.Mock<any>;
const mockDeleteStatusRecord = deleteStatusRecord as jest.Mock<any>;
const mockUpdatePlayerStatusRecord = updatePlayerStatusRecord as jest.Mock<any>;
const mockSendDeleteEmail = sendDeleteEmail as jest.Mock<any>;
describe('status', () => {
  const testTeams = [
    {
      teamId: 'statusTeam1',
      gameId: 'gameId1',
      playerId: 'playerId1',
      historic: 'true',
      status: 'in',
    },
    {
      teamId: 'statusTeam1',
      gameId: 'gameId2',
      playerId: 'playerId2',
    },
    {
      teamId: 'statusTeam1',
      gameId: 'gameId3',
      playerId: 'playerId3',
      status: 'OUT',
    },
    {
      teamId: 'statusTeam2',
      gameId: 'gameId1',
      playerId: 'playerId4',
    },
    {
      teamId: 'statusTeam2',
      gameId: 'gameId2',
      playerId: 'playerId5',
    },
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when searching single status record', () => {
    test('it should return status 200 and record if found and mask PII', async () => {
      const event: APIEvent<SearchStatus> = {
        queryStringParameters: testTeams[0] as SearchStatus,
        body: JSON.stringify(''),
      };
      const mockReturn = {
        Count: 1,
        Items: [
          {
            ...testTeams[0],
            players: {
              [testTeams[0].playerId]: {
                id: testTeams[0].playerId,
                lastName: 'van',
                firstName: 'will',
                status: 'in',
                phoneNumber: '817',
                email: 'test@test',
                sendEmail: true,
                sendText: true,
                smsDelivered: true,
                type: PlayerTypes.FULL,
              },
            },
          },
        ],
      };
      mockSearchStatusRecord.mockImplementationOnce(() => {
        return mockReturn;
      });
      const actual = await searchStatus(event);
      const expected = setResponse(200, JSON.parse(JSON.stringify(mockReturn)), testTeams[0]);
      const expectedPlayer = {
        email: null,
        firstName: 'will',
        id: 'playerId1',
        lastName: 'v',
        phoneNumber: null,
        sendEmail: null,
        sendText: null,
        smsDelivered: null,
        status: 'in',
        type: 'full',
      };
      console.log(mockReturn.Items[0].players);
      expect(JSON.parse(actual.body)).toEqual(JSON.parse(expected.body));
      expect(JSON.parse(actual.body).response.Items[0].players[0]).toEqual(expectedPlayer);

      expect(actual.statusCode).toBe(expected.statusCode);
    });
    test('it should return status 200 and empty body if no record', async () => {
      const event: APIEvent<SearchStatus> = {
        queryStringParameters: testTeams[0] as SearchStatus,
        body: JSON.stringify(''),
      };
      const mockReturn = {
        Count: 0,
      };
      mockSearchStatusRecord.mockImplementationOnce(() => {
        return mockReturn;
      });
      const actual = await searchStatus(event);
      const expected = setResponse(200, { Count: 0 }, testTeams[0]);
      expect(JSON.parse(actual.body)).toEqual(JSON.parse(expected.body));
      expect(actual.statusCode).toBe(expected.statusCode);
    });
    test('it should return status 500 if search fails', async () => {
      const event: APIEvent<SearchStatus> = {
        queryStringParameters: testTeams[0] as SearchStatus,
        body: JSON.stringify(''),
      };
      const mockReturn = {
        Count: 1,
      };
      mockSearchStatusRecord.mockImplementationOnce(() => {
        return mockReturn;
      });
      const actual = await searchStatus(event);
      const expected = setResponse(500, { error: "Cannot read property '0' of undefined" }, testTeams[0]);
      expect(JSON.parse(actual.body)).toEqual(JSON.parse(expected.body));
      expect(actual.statusCode).toBe(expected.statusCode);
    });
  });

  describe('when searching team status records', () => {
    test('it should return status 200 and records if found', async () => {
      const event: APIEvent<SearchStatuses> = {
        queryStringParameters: testTeams[0] as SearchStatuses,
        body: JSON.stringify(''),
      };
      const mockReturn = {
        Count: 1,
        Items: [{ ...testTeams[0], players: { [testTeams[0].playerId]: testTeams[0].playerId } }],
      };
      mockSearchStatusRecord.mockImplementationOnce(() => {
        return mockReturn;
      });
      const actual = await searchStatuses(event);
      const expected = setResponse(200, { ...mockReturn }, testTeams[0]);
      expect(JSON.parse(actual.body).response).toEqual(mockReturn);
      expect(actual.statusCode).toBe(expected.statusCode);
    });
    test('it should return status 200 if no found', async () => {
      const event: APIEvent<SearchStatuses> = {
        queryStringParameters: testTeams[0] as SearchStatuses,
        body: JSON.stringify(''),
      };
      const mockReturn = {
        Count: 0,
        Items: [{ ...testTeams[0], players: { [testTeams[0].playerId]: testTeams[0].playerId } }],
      };
      mockSearchStatusRecord.mockImplementationOnce(() => {
        return mockReturn;
      });
      const actual = await searchStatuses(event);
      const expected = setResponse(200, { ...mockReturn }, testTeams[0]);
      expect(JSON.parse(actual.body).response).toEqual(mockReturn);
      expect(actual.statusCode).toBe(expected.statusCode);
    });
    test('it should return status 500 unable to search', async () => {
      const event: APIEvent<SearchStatuses> = {
        queryStringParameters: testTeams[0] as SearchStatuses,
        body: JSON.stringify(''),
      };
      mockSearchStatusRecord.mockImplementationOnce(() => {
        throw new Error('testError');
      });
      const actual = await searchStatuses(event);
      const expected = setResponse(500, { error: 'testError' }, testTeams[0]);
      expect(JSON.parse(actual.body)).toEqual(JSON.parse(expected.body));
      expect(actual.statusCode).toBe(expected.statusCode);
    });
  });

  describe('when deleting statusGame', () => {
    test('it should return 200 when given valid team and game id and send notifications if game in future', async () => {
      const event = { queryStringParameters: testTeams[0], body: JSON.stringify(testTeams[0]) };
      mockDeleteStatusRecord.mockImplementationOnce(() => {
        const testDate = new Date('2030-07-19T06:14:35.749Z');
        return {
          Attributes: {
            dateTime: testDate,
            players: [
              {
                sendEmail: true,
              },
              {
                sendText: true,
              },
            ],
          },
        };
      });
      const actual = await deleteStatus(event);
      const expected = setResponse(200, {}, testTeams[0]);
      expect(mockSendDeleteEmail.mock.calls).toHaveLength(1);
      expect(actual.statusCode).toBe(expected.statusCode);
    });
    test('it should return 200 when given valid team and game id and not send notifications if game in future and not send flags enabled', async () => {
      const event = { queryStringParameters: testTeams[0], body: JSON.stringify(testTeams[0]) };
      mockDeleteStatusRecord.mockImplementationOnce(() => {
        const testDate = new Date('2030-07-19T06:14:35.749Z');
        return {
          Attributes: {
            dateTime: testDate,
            players: [
              {
                sendEmail: false,
              },
              {
                sendText: false,
              },
            ],
          },
        };
      });
      const actual = await deleteStatus(event);
      const expected = setResponse(200, {}, testTeams[0]);
      expect(actual.statusCode).toBe(expected.statusCode);
    });
    test('it should return 200 when given valid team and game id and not send notifications if game in past', async () => {
      const event = { queryStringParameters: testTeams[0], body: JSON.stringify(testTeams[0]) };
      mockDeleteStatusRecord.mockImplementationOnce(() => {
        const testDate = new Date('2010-07-19T06:14:35.749Z');
        return {
          Attributes: {
            dateTime: testDate,
            players: [
              {
                sendEmail: true,
              },
              {
                sendText: true,
              },
            ],
          },
        };
      });
      const actual = await deleteStatus(event);
      const expected = setResponse(200, {}, testTeams[0]);
      expect(mockSendDeleteEmail.mock.calls).toHaveLength(0);
      expect(actual.statusCode).toBe(expected.statusCode);
    });
    test('it should return 400 when given invalid team and game id', async () => {
      const event = { queryStringParameters: testTeams[0], body: JSON.stringify({ fake: 'hello' }) };
      const actual = await deleteStatus(event);
      const expected = setResponse(400, {}, testTeams[0]);
      expect(mockSendDeleteEmail.mock.calls).toHaveLength(0);
      expect(actual.statusCode).toBe(expected.statusCode);
    });
    test('it should return 500 when unable to delete', async () => {
      const event = { queryStringParameters: testTeams[0], body: JSON.stringify(testTeams[0]) };
      mockDeleteStatusRecord.mockImplementationOnce(() => {
        throw new Error('TestError');
      });
      const actual = await deleteStatus(event);
      const expected = setResponse(500, {}, testTeams[0]);
      expect(mockSendDeleteEmail.mock.calls).toHaveLength(0);
      expect(actual.statusCode).toBe(expected.statusCode);
    });
  });

  describe('when updating player status', () => {
    test('it should return 201 when teamId, gameId, playerId, and status is provided', async () => {
      const event = { body: JSON.stringify(testTeams[0]), queryStringParameters: '' };
      mockUpdatePlayerStatusRecord.mockImplementationOnce(() => {
        return testTeams[0];
      });
      const actual = await updatePlayerStatus(event);
      const expected = setResponse(201, testTeams[0], testTeams[0]);
      expect(actual.statusCode).toBe(expected.statusCode);
      expect(JSON.parse(actual.body)).toEqual(JSON.parse(expected.body));
    });
    test('it should return 400 when teamId, gameId, playerId, and status is not provided', async () => {
      const event = { body: JSON.stringify(testTeams[1]), queryStringParameters: '' };
      mockUpdatePlayerStatusRecord.mockImplementationOnce(() => {
        return testTeams[1];
      });
      const actual = await updatePlayerStatus(event);
      const expected = setResponse(
        400,
        { error: 'Team, Game, playerNumber and status information not provided' },
        testTeams[1],
      );
      expect(actual.statusCode).toBe(expected.statusCode);
      expect(JSON.parse(actual.body)).toEqual(JSON.parse(expected.body));
    });
    test('it should return 500 when unable to update', async () => {
      jest.resetAllMocks();
      const event = { body: JSON.stringify(testTeams[0]), queryStringParameters: '' };
      mockUpdatePlayerStatusRecord.mockImplementationOnce(() => {
        throw new Error('TestError');
      });
      const actual = await updatePlayerStatus(event);
      const expected = setResponse(500, { error: 'TestError' }, testTeams[0]);
      expect(actual.statusCode).toBe(expected.statusCode);
      expect(JSON.parse(actual.body)).toEqual(JSON.parse(expected.body));
    });
  });
});
