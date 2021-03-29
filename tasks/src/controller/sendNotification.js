'use strict';
const { sendMsg } = require('../service/sendNotification');
const { snsEventSave } = require('../service/notificationEventsDb');

const checkSendable = (player) => {
  return player.phoneNumber.length === 10 && player.sendText;
};

module.exports.sendSms = async (event) => {
  try {
    const messageInfo = JSON.parse(event.Records[0].Sns.Message);
    const teamInfo = messageInfo.data;
    console.info('sendSms lambda received msg: ', messageInfo);
    const smsPlayers = teamInfo.players.filter((player) => {
      player.phoneNumber = player.phoneNumber.replace(/\D/g, '');
      return checkSendable(player);
    });
    const snsIds = await Promise.all(
      smsPlayers.map((player) => {
        return sendMsg(messageInfo.statusType, teamInfo, player);
      }),
    );
    const result = {
      teamInfo: {
        teamName: teamInfo.teamName,
        dateTime: teamInfo.dateTime,
        teamId: teamInfo.teamId,
        gameId: teamInfo.gameId,
      },
      players: smsPlayers.map((player, i) => {
        return { phoneNumber: player.phoneNumber, id: player.id, snsMessageId: snsIds[i].MessageId };
      }),
      statusType: messageInfo.statusType,
    };
    if (smsPlayers.length > 0) {
      await snsEventSave(result);
    }
  } catch (e) {
    console.error('sendSms error: ', e, e.message);
  }
  return 'success';
};
