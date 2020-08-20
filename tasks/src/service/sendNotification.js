'use strict';
const { SNS } = require('aws-sdk');
const sns = new SNS({ apiVersion: '2010-03-31', SMS: { smsType: 'Transactional' } });
const { sendStatusTypes } = require('../helper');

const getMessage = (statusType, teamInfo, player) => {
  let message = '';
  const baseUrl =
    process.env.env === 'prod'
      ? process.env.baseUrl.replace('<stage>', '')
      : process.env.baseUrl.replace('<stage>', `-${process.env.env}`);
  switch (statusType) {
    case sendStatusTypes.NEW_GAME:
      message = `Confirm your status for ${teamInfo.teamName} game at ${teamInfo.dateTime}: ${baseUrl}/statusUpdate?t=${teamInfo.teamId}&g=${teamInfo.gameId}&p=${player.id}`;
      break;
    case sendStatusTypes.DELETE_GAME:
      message = `${teamInfo.teamName} game at ${teamInfo.dateTime} has been canceled or rescheduled.`;
      break;
  }
  return message;
};

module.exports = {
  sendMsg: (messageInfo, teamInfo, player) => {
    const smsData = {
      Message: getMessage(messageInfo.statusType, teamInfo, player),
      PhoneNumber: `1${player.phoneNumber}`,
    };
    return sns.publish(smsData).promise();
  },
};
