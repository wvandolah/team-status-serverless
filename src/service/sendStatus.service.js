'use strict';

const AWS = require('aws-sdk');
const SNS = new AWS.SNS({ apiVersion: '2010-03-31', SMS: { smsType: 'Transactional' } });

module.exports = {
  sendSMS: (player, data, gameId) => {
    console.log(player);
    const smsData = {
      Message: `Confirm your status for ${data.teamName} game at ${new Date(data.dateTime).toLocaleString(
        'en-US',
      )}: https://teamstatus.wvandolah.com/statusUpdate?t=${data.teamId}&g=${gameId}&p=${player.id}`,
      PhoneNumber: `+1${player.phoneNumber}`,
    };
    // Sending sms costs $0.0065/msg
    if (process.env.IS_OFFLINE) {
      console.log(smsData);
      const mockResponse = {
        ResponseMetadata: {
          RequestId: player.id,
        },
        MessageId: 'da5a27f3-a831-5158-8594-70f62df89f76',
      };
      return new Promise((resolve) => resolve(mockResponse));
    }

    return SNS.publish(smsData).promise();
  },
};
