'use strict';
const { sendStatusTypes } = require('../helper');
const { SNS } = require('aws-sdk');
const sns = new SNS({ apiVersion: '2010-03-31', SMS: { smsType: 'Transactional' } });

const checkSendable = (player) => {
  const onlyNumber = player.phoneNumber.replace(/\D/g, '');
  return onlyNumber.length === 10 && player.sendText;
};

const getMessage = (statusType, teamInfo, player) => {
  let message = '';
  switch (statusType) {
    case sendStatusTypes.NEW_GAME:
      message = `Confirm your status for ${teamInfo.teamName} game at ${teamInfo.dateTime}: https://teamstatus.wvandolah.com/statusUpdate?t=${teamInfo.teamId}&g=${teamInfo.gameId}&p=${player.id}`;
      break;
    case sendStatusTypes.DELETE_GAME:
      message = `${teamInfo.teamName} game at ${teamInfo.dateTime} has been canceled or rescheduled.`;
      break;
  }
  return message;
};

module.exports.sendSms = async (event) => {
  try {
    const messageInfo = JSON.parse(event.Records[0].Sns.Message);
    const teamInfo = messageInfo.data;
    console.log('sendSms lambda received msg: ', messageInfo);
    await Promise.all(
      teamInfo.players
        .filter((player) => checkSendable(player))
        .map((player) => {
          const smsData = {
            Message: getMessage(messageInfo.statusType, teamInfo, player),
            PhoneNumber: `1${player.phoneNumber}`,
          };
          return sns.publish(smsData).promise();
        }),
    );
  } catch (e) {
    console.warn(e.message);
  }
  return 'success';
};
