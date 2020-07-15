const { createStatusRecord, searchStatusRecord } = require('../src/service/statusDB.service');

const testTeams = [
  {
    teamId: 'statusTeam1',
    gameId: 'statusGame1',
  },
  {
    teamId: 'statusTeam1',
    gameId: 'statusGame2',
  },
  {
    teamId: 'statusTeam1',
    gameId: 'statusGame3',
  },
  {
    teamId: 'statusTeam2',
    gameId: 'statusGame1',
  },
  {
    teamId: 'statusTeam2',
    gameId: 'statusGame2',
  },
];

beforeAll(() => {
  return Promise.all(testTeams.map((teamGames) => createStatusRecord(teamGames)));
});

describe('when creating new status record', () => {
  test('it saves to database', async () => {
    const saveTeam = { teamId: 'teamId', gameId: 'gameId' };
    await createStatusRecord(saveTeam);
    const actual = await searchAndExtractResults(saveTeam);
    expect(actual[0]).toEqual(saveTeam);
  });

  test('it does not save when not given teamId', async () => {
    try {
      await createStatusRecord({ gameId: 'gameId' });
      expect(true).toBe(false);
    } catch (e) {
      expect(e.message).toBe('One of the required keys was not given a value');
    }
  });

  test('it does not save when not given gameId', async () => {
    try {
      await createStatusRecord({ teamId: 'teamId' });
      expect(true).toBe(false);
    } catch (e) {
      expect(e.message).toBe('One of the required keys was not given a value');
    }
  });
});

describe('when searching status record', () => {
  test('it finds all records by gameId and teamId', async () => {
    const actual = await searchAndExtractResults(testTeams[0]);
    expect(actual[0]).toEqual(testTeams[0]);
  });

  test('it returns nothing when no teams found', async () => {
    const actual = await searchAndExtractResults({ teamId: 'invalidTeamId', gameId: 'gameId' });
    expect(actual).toHaveLength(0);
  });

  test('it returns all team games when only searching teamId', async () => {
    const actual = await searchAndExtractResults({ teamId: 'statusTeam1' });
    expect(actual).toHaveLength(3);
    for (let i = 0; i < 3; i++) {
      expect(actual[i].teamId).toBe(testTeams[i].teamId);
      expect(actual[i].gameId).toBe(testTeams[i].gameId);
    }

    const actual2 = await searchAndExtractResults({ teamId: 'statusTeam2' });
    expect(actual2).toHaveLength(2);
    for (let i = 0; i < 2; i++) {
      expect(actual2[i].teamId).toBe(testTeams[i + 3].teamId);
      expect(actual2[i].gameId).toBe(testTeams[i + 3].gameId);
    }
  });

  test('if no teamId, throws error', async () => {
    try {
      await searchStatusRecord({ gameId: 'gameId' });
      expect(true).toBe(false);
    } catch (e) {
      expect(e.message).toBe('Team information not provided');
    }
  });
});

const searchAndExtractResults = async (gameTeam) => {
  const results = await searchStatusRecord(gameTeam);
  return results.Items;
};
