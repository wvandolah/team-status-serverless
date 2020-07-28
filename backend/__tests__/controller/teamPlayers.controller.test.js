const { create, search, deleteTeamPlayer } = require('../../src/controller/teamPlayers.controller');
const { setResponse } = require('../../src/helper');
const {
  createTeamPlayerRecord,
  searchTeamPlayerRecord,
  deleteTeamPlayerRecord,
} = require('../../src/service/teamPlayers.service');

jest.mock('../../src/service/teamPlayers.service', () => {
  return {
    searchTeamPlayerRecord: jest.fn().mockReturnThis(),
    createTeamPlayerRecord: jest.fn().mockReturnThis(),
    deleteTeamPlayerRecord: jest.fn().mockReturnThis(),
  };
});
describe('teamPlayers.controller', () => {
  const testTeams = [
    {
      teamId: 'statusTeam1',
      userId: 'userId1',
    },
    {
      teamId: 'statusTeam1',
      userId: 'userId2',
    },
    {
      teamId: 'statusTeam1',
      userId: 'userId3',
    },
    {
      teamId: 'statusTeam2',
      userId: 'userId1',
    },
    {
      teamId: 'statusTeam2',
      userId: 'userId2',
    },
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('when creating  teamPlayer', () => {
    test('it saves correct when given needed information', async () => {
      const body = {
        userId: 'testUserId',
        teamId: 'testTeamId',
        players: [
          {
            name: 'testName',
          },
        ],
      };
      const event = {
        body: JSON.stringify(body),
      };
      const actual = await create(event);
      expect(actual).toEqual(setResponse(201, body, body));
    });
    test('it returns status code 400 when not given required information', async () => {
      const body = {
        userId: 'testUserId2',
        players: [
          {
            name: 'testName',
          },
        ],
      };
      const event = {
        body: JSON.stringify(body),
      };
      const actual = await create(event);
      expect(actual).toEqual(setResponse(400, { error: 'All needed information not provided' }, body));
    });
    test('it returns status code 500 when unable to save', async () => {
      const body = {
        userId: 'testUserId2',
        teamId: 'testTeamId',
        players: [
          {
            name: 'testName',
          },
        ],
      };
      const event = {
        body: JSON.stringify(body),
      };
      createTeamPlayerRecord.mockImplementationOnce(() => {
        throw new Error('Test Error');
      });
      const actual = await create(event);
      expect(actual).toEqual(setResponse(500, { error: 'Test Error' }, body));
    });
  });

  describe('when searching teamPlayer', () => {
    test('it finds correct when given valid teamId and userId', async () => {
      const event = { queryStringParameters: testTeams[0], body: JSON.stringify('') };
      searchTeamPlayerRecord.mockImplementationOnce(() => {
        return testTeams[0];
      });
      const actual = await search(event);
      const expected = setResponse(200, testTeams[0], testTeams[0]);
      expect(JSON.parse(actual.body)).toEqual(JSON.parse(expected.body));
      expect(actual.statusCode).toBe(expected.statusCode);
    });
    test('it finds all teams when given valid userId', async () => {
      const searchTerms = { userId: testTeams[0].userId };
      const event = { queryStringParameters: searchTerms, body: JSON.stringify('') };
      searchTeamPlayerRecord.mockImplementationOnce(() => {
        return [testTeams[0], testTeams[3]];
      });
      const actual = await search(event);

      const expected = setResponse(200, [testTeams[0], testTeams[3]], searchTerms);
      expect(JSON.parse(actual.body)).toEqual(JSON.parse(expected.body));
      expect(actual.statusCode).toBe(expected.statusCode);
    });
    test('it returns 400 status when no userId', async () => {
      const searchTerms = { userIds: 'invalidKey' };
      const event = { queryStringParameters: searchTerms, body: JSON.stringify('') };
      const actual = await search(event);

      const expected = setResponse(400, { error: 'UserId is required' }, searchTerms);
      expect(JSON.parse(actual.body)).toEqual(JSON.parse(expected.body));
      expect(actual.statusCode).toBe(expected.statusCode);
    });

    test('it returns 500 status when save fails', async () => {
      const searchTerms = { userId: testTeams[0].userId };
      const event = { queryStringParameters: searchTerms, body: JSON.stringify('') };
      searchTeamPlayerRecord.mockImplementationOnce(() => {
        throw new Error('Test Error');
      });
      const actual = await search(event);

      const expected = setResponse(500, { error: 'Test Error' }, searchTerms);
      expect(JSON.parse(actual.body)).toEqual(JSON.parse(expected.body));
      expect(actual.statusCode).toBe(expected.statusCode);
    });
  });

  describe('when deleting teamPlayer', () => {
    test('it should delete when provided valid userId and teamId', async () => {
      const event = { queryStringParameters: testTeams[0], body: JSON.stringify('') };
      deleteTeamPlayerRecord.mockImplementationOnce(() => {
        return testTeams[0];
      });
      const actual = await deleteTeamPlayer(event);
      const expected = setResponse(200, testTeams[0], testTeams[0]);
      expect(JSON.parse(actual.body)).toEqual(JSON.parse(expected.body));
      expect(actual.statusCode).toBe(expected.statusCode);
    });
    test('it should not delete when not provided valid userId and teamId', async () => {
      const event = { queryStringParameters: {}, body: JSON.stringify('') };
      deleteTeamPlayerRecord.mockImplementationOnce(() => {
        throw new Error('Test Error');
      });
      const actual = await deleteTeamPlayer(event);
      const expected = setResponse(400, { error: 'userId and teamId is required' }, {});
      expect(JSON.parse(actual.body)).toEqual(JSON.parse(expected.body));
      expect(actual.statusCode).toBe(expected.statusCode);
    });
    test('it should 500 status when fails to delete', async () => {
      const event = { queryStringParameters: testTeams[0], body: JSON.stringify('') };

      const actual = await deleteTeamPlayer(event);
      const expected = setResponse(500, { error: 'Test Error' }, testTeams[0]);
      expect(JSON.parse(actual.body)).toEqual(JSON.parse(expected.body));
      expect(actual.statusCode).toBe(expected.statusCode);
    });
  });
});
