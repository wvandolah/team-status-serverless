import { PlayerStatus, PlayerTypes, Status } from '../../../common/models';
import {
  createStatusRecord,
  searchStatusRecord,
  deleteStatusRecord,
  updatePlayerStatusRecord,
} from '../../src/service/statusDB.service';

const testTeams = [
  {
    teamId: 'statusTeam1',
    gameId: 'statusGame1',
    dateTime: '2099-03-03T17:15:00.000Z',
    players: {
      playerId0: {
        id: 'playerId0',
        email: 'dummy-email',
        firstName: 'dummy-firstName',
        lastName: 'dummy-lastName',
        phoneNumber: 'dummy-phoneNumber',
        sendEmail: true,
        sendText: true,
        smsDelivered: true,
        type: PlayerTypes.FULL,
      },
    },
  },
  {
    teamId: 'statusTeam1',
    gameId: 'statusGame2',
    players: {
      playerId1: {
        id: 'playerId1',
        email: 'dummy-email',
        firstName: 'dummy-firstName',
        lastName: 'dummy-lastName',
        phoneNumber: 'dummy-phoneNumber',
        sendEmail: true,
        sendText: true,
        smsDelivered: true,
        type: PlayerTypes.FULL,
      },
    },
  },
  {
    teamId: 'statusTeam1',
    gameId: 'statusGame3',
    players: {
      playerId0: {
        id: 'playerId0',
        email: 'dummy-email',
        firstName: 'dummy-firstName',
        lastName: 'dummy-lastName',
        phoneNumber: 'dummy-phoneNumber',
        sendEmail: true,
        sendText: true,
        smsDelivered: true,
        type: PlayerTypes.FULL,
      },
    },
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
describe('statusDB.service', () => {
  describe('when creating new status record', () => {
    test('it saves to database', async () => {
      const saveTeam = { teamId: 'teamId', gameId: 'gameId', historic: 'true' };
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
    test('it returns nothing when no teams found', async () => {
      const actual = await searchAndExtractResults({ teamId: 'invalidTeamId', gameId: 'gameId' });
      expect(actual).toHaveLength(0);
    });

    test('it returns all team games when only searching teamId', async () => {
      const actual = await searchAndExtractResults({ teamId: 'statusTeam1', historic: 'true' });
      expect(actual).toHaveLength(3);
      for (let i = 0; i < 3; i++) {
        expect(actual[i].teamId).toBe(testTeams[i].teamId);
        expect(actual[i].gameId).toBe(testTeams[i].gameId);
      }

      const actual2 = await searchAndExtractResults({ teamId: 'statusTeam2', historic: 'true' });
      expect(actual2).toHaveLength(2);
      for (let i = 0; i < 2; i++) {
        expect(actual2[i].teamId).toBe(testTeams[i + 3].teamId);
        expect(actual2[i].gameId).toBe(testTeams[i + 3].gameId);
      }
    });

    test('it returns all future team games when only searching teamId and historic is false', async () => {
      const actual = await searchAndExtractResults({ teamId: 'statusTeam1', historic: 'false' });
      expect(actual).toHaveLength(1);
      for (let i = 0; i < 1; i++) {
        expect(actual[i].teamId).toBe(testTeams[i].teamId);
        expect(actual[i].gameId).toBe(testTeams[i].gameId);
      }
    });

    test('it returns all team games for player when searching teamId and playerId and historic is true', async () => {
      const actual = await searchAndExtractResults({
        teamId: 'statusTeam1',
        historic: 'true',
        playerId: 'playerId1',
      });
      expect(actual).toHaveLength(1);

      expect(actual[0].teamId).toBe(testTeams[1].teamId);
      expect(actual[0].gameId).toBe(testTeams[1].gameId);
      expect(actual[0].players['playerId1'].id).toBe('playerId1');
    });

    test('it returns future team games for player when searching teamId and playerId and historic is false', async () => {
      const actual = await searchAndExtractResults({
        teamId: 'statusTeam1',
        historic: 'false',
        playerId: 'playerId0',
      });
      expect(actual).toHaveLength(1);

      expect(actual[0].teamId).toBe(testTeams[0].teamId);
      expect(actual[0].gameId).toBe(testTeams[0].gameId);
      expect(actual[0].players['playerId0'].id).toBe('playerId0');
    });

    test('if no teamId, throws error', async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await searchStatusRecord({ gameId: 'gameId' });
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe('Team information not provided');
      }
    });
  });

  describe('when deleting a status', () => {
    test('should return deleted value', async () => {
      const saveTeam = { teamId: 'deleteId', gameId: 'deleteId' };
      await createStatusRecord(saveTeam);

      const actual = await deleteStatusRecord(saveTeam);

      expect(actual.Attributes).toEqual(saveTeam);
    });
    test('should delete from database', async () => {
      const saveTeam = { teamId: 'deleteId', gameId: 'deleteId' };
      await createStatusRecord(saveTeam);

      const deleted = await deleteStatusRecord(saveTeam);
      const actual = await searchAndExtractResults(deleted.Attributes);
      expect(actual).toHaveLength(0);
    });
    test('should throw error in teamId not provided', async () => {
      const saveTeam = { gameId: 'deleteId' };
      try {
        await deleteStatusRecord(saveTeam);
        expect(true).toBe(false);
      } catch (e) {
        expect(e.message).toBe('The number of conditions on the keys is invalid');
      }
    });
  });
  describe('when updating a player status record', () => {
    const saveTeam: Status = {
      teamId: 'updatePlayerTeamId',
      gameId: 'updatePlayerGameId',
      players: {
        firstPlayerId: {
          id: 'testId2',
          phoneNumber: '1234567894',
          sendEmail: false,
          sendText: false,
          email: 'testEmail@testEmail.com',
          type: PlayerTypes.FULL,
          status: PlayerStatus.OUT,
          smsDelivered: false,
          firstName: 'testFirstName',
          lastName: 'testLastName',
        },
      },
    };
    const updatePlayerBaseParams = {
      teamId: saveTeam.teamId,
      gameId: saveTeam.gameId,
      playerId: 'firstPlayerId',
    };
    beforeEach(() => {
      return createStatusRecord(saveTeam);
    });
    afterEach(() => {
      return deleteStatusRecord(saveTeam);
    });
    test('should update status when given status', async () => {
      const updatePlayerStatusParams = { ...updatePlayerBaseParams, updateField: 'status', updateValue: 'In' };
      const actual = await updatePlayerStatusRecord(updatePlayerStatusParams);

      expect(actual.Attributes.players[updatePlayerStatusParams.playerId].status).toEqual('In');
    });
    test('should update smsDelivered when given smsDelivered', async () => {
      const updatePlayerStatusParams = {
        ...updatePlayerBaseParams,
        updateField: 'smsDelivered',
        updateValue: 'success',
      };
      const actual = await updatePlayerStatusRecord(updatePlayerStatusParams);
      expect(actual.Attributes.players[updatePlayerStatusParams.playerId].smsDelivered).toEqual('success');
    });
  });
});

const searchAndExtractResults = async (gameTeam) => {
  const results = await searchStatusRecord(gameTeam);
  return results.Items;
};
