const { updateSmsDeliveryStatus } = require('../../src/service/statusDB');
const { smsDeliveryTypes } = require('../../src/helper');

describe('statusDB', () => {
  const savedSnsEvent = {
    statusType: 0,
    snsMessageId: 'f24cce2f-346d-5ebe-b864-99eb84ef1578',
    retries: 0,
    player: { phoneNumber: '8178178171', id: '_6tVhnSou', snsMessageId: 'f24cce2f-346d-5ebe-b864-99eb84ef1578' },
    teamInfo: { teamName: 'A', dateTime: '8/29/2020, 2:36:31 PM', gameId: '7rQx-4ogw', teamId: '9hie_SVJi' },
  };
  test('it should update sms delivery status', async () => {
    const { teamId, gameId } = savedSnsEvent.teamInfo;
    const { id } = savedSnsEvent.player;
    const smsDelivered = smsDeliveryTypes.SUCCESS;
    const { Attributes } = await updateSmsDeliveryStatus(teamId, gameId, id, smsDelivered);
    expect(Attributes.players[id].smsDelivered).toBe(smsDeliveryTypes.SUCCESS);
  });
});
