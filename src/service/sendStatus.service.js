'use strict';

const AWS = require('aws-sdk');
const SNS = new AWS.SNS({ apiVersion: '2010-03-31', SMS: { smsType: 'Transactional' } });

const sendSMS = (message, phoneNumber) => {
  const smsData = {
    Message: message,
    PhoneNumber: `+1${phoneNumber}`,
  };
  // Sending sms costs $0.0065/msg
  if (process.env.IS_OFFLINE) {
    console.log(smsData);
    const mockResponse = {
      ResponseMetadata: {
        RequestId: message,
      },
      MessageId: 'da5a27f3-a831-5158-8594-70f62df89f76',
    };
    return new Promise((resolve) => resolve(mockResponse));
  }

  return SNS.publish(smsData).promise();
};

module.exports = {
  sendStatusSMS: (player, data, gameId) => {
    const message = `Confirm your status for ${data.teamName} game at ${data.dateTime}: https://teamstatus.wvandolah.com/statusUpdate?t=${data.teamId}&g=${gameId}&p=${player.id}`;
    return sendSMS(message, player.phoneNumber);
  },

  sendDeleteSMS: (player, data) => {
    const message = `${data.teamName} game at ${data.dateTime} has been canceled or rescheduled.`;
    return sendSMS(message, player.phoneNumber);
  },
};
