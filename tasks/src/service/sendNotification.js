'use strict';
const { SNS } = require('aws-sdk');
const sns = new SNS({ apiVersion: '2010-03-31', SMS: { smsType: 'Transactional' }, region: 'us-east-1' });
const { sendStatusTypes } = require('../helper');

const getMessage = (statusType, teamInfo, player) => {
  let message = '';
  const dateTime = new Date(teamInfo.dateTime).toLocaleString('en-US', {
    timeZone: 'America/Chicago',
  });
  const baseUrl =
    process.env.env !== 'prod'
      ? process.env.baseUrl.replace('<stage>', `-${process.env.env}`)
      : process.env.baseUrl.replace('<stage>', '');
  switch (statusType) {
    case sendStatusTypes.NEW_GAME:
      message = `Confirm your status for ${teamInfo.teamName} game at ${dateTime}: ${baseUrl}/statusUpdate?t=${teamInfo.teamId}&p=${player.id}`;
      break;
    case sendStatusTypes.DELETE_GAME:
      message = `${teamInfo.teamName} game at ${dateTime} has been canceled or rescheduled.`;
      break;
  }
  return message;
};

module.exports = {
  sendMsg: (statusType, teamInfo, player) => {
    const smsData = {
      Message: getMessage(statusType, teamInfo, player),
      PhoneNumber: `+1${player.phoneNumber.replace(/\D/g, '')}`,
    };
    console.log('[sendNotification.service]: publishing sms data: ', smsData);
    return sns.publish(smsData).promise();
  },
};
