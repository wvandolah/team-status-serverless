const {
  createTeamPlayerRecord,
  searchTeamPlayerRecord,
  deleteTeamPlayerRecord,
} = require('../../src/service/teamPlayers.service');
const testTeams = [
  {
    teamId: 'statusTeam1',
    userId: 'statusGame1',
  },
  {
    teamId: 'statusTeam1',
    userId: 'statusGame2',
  },
  {
    teamId: 'statusTeam1',
    userId: 'statusGame3',
  },
  {
    teamId: 'statusTeam2',
    userId: 'statusGame1',
  },
  {
    teamId: 'statusTeam2',
    userId: 'statusGame2',
  },
];

describe('teamPlayer.service', () => {
  beforeAll(() => {
    return Promise.all(testTeams.map((teamGames) => createTeamPlayerRecord(teamGames)));
  });
  describe('when creating new team', () => {
    test('it saves to database', async () => {
      const saveTeam = { teamId: 'teamId', userId: 'userId' };
      await createTeamPlayerRecord(saveTeam);
      const actual = await searchTeamPlayerRecord(saveTeam);
      expect(actual.Count).toBe(1);
      expect(actual.Items[0]).toEqual(saveTeam);
    });
    test('it does not save when not given teamId', async () => {
      try {
        await createTeamPlayerRecord({ userId: 'userId2' });
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe('One of the required keys was not given a value');
      }
    });
  });
  describe('when searching for team', () => {
    test('it should find team when userId and TeamId are provided', async () => {
      const actual = await searchTeamPlayerRecord({ teamId: 'statusTeam1', userId: 'statusGame1' });
      expect(actual.Count).toBe(1);
      expect(actual.Items[0]).toEqual({ teamId: 'statusTeam1', userId: 'statusGame1' });
    });
    test('it should find all users team when only userId is provided', async () => {
      const actual = await searchTeamPlayerRecord({ userId: 'statusGame1' });

      expect(actual.Count).toBe(2);
      expect(actual.Items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            userId: 'statusGame1',
          }),
        ]),
      );
    });
    test('it does not save when not given teamId', async () => {
      try {
        await searchTeamPlayerRecord({ fakeKey: 'userId2' });
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe('User information not provided');
      }
    });
  });
  describe('when deleting a team', () => {
    const saveTeam = { teamId: 'deleteTeamId', userId: 'deleteUserId' };
    beforeEach(() => {
      return createTeamPlayerRecord(saveTeam);
    });
    test('it should return deleted values', async () => {
      const actual = await deleteTeamPlayerRecord(saveTeam);
      expect(actual.Attributes).toEqual(saveTeam);
    });
    test('it should delete values', async () => {
      await deleteTeamPlayerRecord(saveTeam);
      const actual = await searchTeamPlayerRecord(saveTeam);

      expect(actual.Count).toBe(0);
    });
  });
});
