const { snsEventSave, snsEventQuery } = require('../../src/service/notificationEventsDb');

describe('notificationEventsDB', () => {
  describe('when receiving sns ids for new event', () => {
    test('it should save sns, playerId, teamId, send', async () => {
      const validInput = {
        gameId: 'gameId',
        teamId: 'teamId',
        players: [
          {
            id: 'playerId1',
            snsMessageId: 'snsMessageId1',
          },
          {
            id: 'playerId2',
            snsMessageId: 'snsMessageId2',
          },
        ],
      };
      const actual = await snsEventSave(validInput);

      expect(actual).not.toBeNull();
    });
  });

  describe('when querying db given a valid sns', () => {
    const validInput = {
      gameId: 'gameId',
      teamId: 'teamId',
      players: [
        {
          id: 'playerId1',
          snsMessageId: 'querySnsId1',
        },
        {
          id: 'playerId2',
          snsMessageId: 'querySnsId2',
        },
      ],
    };
    const alsoValidInput = {
      teamInfo: { teamName: 'testing2s', dateTime: '2021-03-09T06:27:10.502Z', teamId: 'VyXY1ikPw', gameId: 'gameId' },
      players: [
        {
          phoneNumber: '8179391234',
          id: 'ZV0xu8M1p',
          snsMessageId: 'querySnsId1',
        },
      ],
      statusType: 0,
      snsMessageId: 'querySnsId1',
      retries: 0,
    };
    const expected = [
      {
        teamInfo: {
          teamName: 'testing2s',
          dateTime: '2021-03-09T06:27:10.502Z',
          teamId: 'VyXY1ikPw',
          gameId: 'gameId',
        },
        player: {
          phoneNumber: '8179391234',
          id: 'ZV0xu8M1p',
          snsMessageId: 'querySnsId1',
        },
        statusType: 0,
        snsMessageId: 'querySnsId1',
        retries: 0,
      },
      {
        gameId: 'gameId',
        teamId: 'teamId',
        id: 'playerId2',
        snsMessageId: 'querySnsId2',
      },
    ];
    beforeAll(async () => {
      await snsEventSave(alsoValidInput);
    });
    test('it should return event', async () => {
      const actual = await snsEventQuery(alsoValidInput.players[0].snsMessageId);
      expect(actual.Items[0]).toEqual(expected[0]);
    });
  });
});
