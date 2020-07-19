const {
  searchStatus,
  searchStatuses,
  deleteStatus,
  updatePlayerStatus,
} = require('../../src/controller/status.controller');
const {
  searchStatusRecord,
  deleteStatusRecord,
  updatePlayerStatusRecord,
} = require('../../src/service/statusDB.service');
const { sendDeleteSMS, sendDeleteEmail } = require('../../src/service/sendStatus.service');
const { setResponse } = require('../../src/helper');

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
  };
});

describe('status.controller', () => {
  const testTeams = [
    {
      teamId: 'statusTeam1',
      gameId: 'gameId1',
      playerId: 'playerId1',
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
    test('it should return status 200 and record if found', async () => {
      const event = { queryStringParameters: testTeams[0], body: JSON.stringify('') };
      const mockReturn = {
        Count: 1,
        Items: [{ ...testTeams[0], players: { [testTeams[0].playerId]: testTeams[0].playerId } }],
      };
      searchStatusRecord.mockImplementationOnce(() => {
        return mockReturn;
      });
      const actual = await searchStatus(event);
      const expected = setResponse(200, { ...mockReturn }, testTeams[0]);
      expect(JSON.parse(actual.body)).toEqual(JSON.parse(expected.body));
      expect(actual.statusCode).toBe(expected.statusCode);
    });
    test('it should return status 200 and empty body if no record', async () => {
      const event = { queryStringParameters: testTeams[0], body: JSON.stringify('') };
      const mockReturn = {
        Count: 0,
      };
      searchStatusRecord.mockImplementationOnce(() => {
        return mockReturn;
      });
      const actual = await searchStatus(event);
      const expected = setResponse(200, {}, testTeams[0]);
      expect(JSON.parse(actual.body)).toEqual(JSON.parse(expected.body));
      expect(actual.statusCode).toBe(expected.statusCode);
    });
    test('it should return status 500 if search fails', async () => {
      const event = { queryStringParameters: testTeams[0], body: JSON.stringify('') };
      const mockReturn = {
        Count: 1,
      };
      searchStatusRecord.mockImplementationOnce(() => {
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
      const event = { queryStringParameters: testTeams[0], body: JSON.stringify('') };
      const mockReturn = {
        Count: 1,
        Items: [{ ...testTeams[0], players: { [testTeams[0].playerId]: testTeams[0].playerId } }],
      };
      searchStatusRecord.mockImplementationOnce(() => {
        return mockReturn;
      });
      const actual = await searchStatuses(event);
      const expected = setResponse(200, { ...mockReturn }, testTeams[0]);
      expect(JSON.parse(actual.body).response).toEqual(mockReturn);
      expect(actual.statusCode).toBe(expected.statusCode);
    });
    test('it should return status 200 if no found', async () => {
      const event = { queryStringParameters: testTeams[0], body: JSON.stringify('') };
      const mockReturn = {
        Count: 0,
        Items: [{ ...testTeams[0], players: { [testTeams[0].playerId]: testTeams[0].playerId } }],
      };
      searchStatusRecord.mockImplementationOnce(() => {
        return mockReturn;
      });
      const actual = await searchStatuses(event);
      const expected = setResponse(200, { ...mockReturn }, testTeams[0]);
      expect(JSON.parse(actual.body).response).toEqual(mockReturn);
      expect(actual.statusCode).toBe(expected.statusCode);
    });
    test('it should return status 500 unable to search', async () => {
      const event = { queryStringParameters: testTeams[0], body: JSON.stringify('') };
      searchStatusRecord.mockImplementationOnce(() => {
        throw new Error('testError');
      });
      const actual = await searchStatuses(event);
      const expected = setResponse(500, { error: 'testError' }, testTeams[0]);
      expect(JSON.parse(actual.body)).toEqual(JSON.parse(expected.body));
      expect(actual.statusCode).toBe(expected.statusCode);
    });
  });
});
