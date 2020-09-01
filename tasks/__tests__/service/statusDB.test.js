const { updateSmsDeliveryStatus } = require('../../src/service/statusDB');

describe('statusDB', () => {
  const savedSnsEvent = {
    statusType: 0,
    snsMessageId: 'f24cce2f-346d-5ebe-b864-99eb84ef1578',
    retries: 0,
    player: { phoneNumber: '8178178171', playerId: '_6tVhnSou', snsMessageId: 'f24cce2f-346d-5ebe-b864-99eb84ef1578' },
    teamInfo: { teamName: 'A', dateTime: '8/29/2020, 2:36:31 PM', gameId: '7rQx-4ogw', teamId: '9hie_SVJi' },
  };
  test('it should update sms delivery status', async () => {
    const { teamId, gameId } = savedSnsEvent.teamInfo;
    const { playerId } = savedSnsEvent.player;
    const smsDelivered = 'successful';
    const { Attributes } = await updateSmsDeliveryStatus(teamId, gameId, playerId, smsDelivered);
    expect(Attributes.players[playerId].smsDelivered).toBe('successful');
  });
});
