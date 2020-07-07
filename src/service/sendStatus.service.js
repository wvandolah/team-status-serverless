'use strict';

const AWS = require('aws-sdk');
const SNS = new AWS.SNS({ apiVersion: '2010-03-31', SMS: { smsType: 'Transactional' } });
const ses = new AWS.SES({ apiVersion: '2010-12-01' });

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
      MessageId: 'da5a27f3-a831-5158-8594-70f62df89f77',
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

  sendDeleteEmail: (players, data) => {
    const params = {
      Destinations: [],
      Source: 'Team Status <doNotReply@wvandolah.com>',
      // ConfigurationSetName: 'failedEmail',
      Template: 'gameDeleteNotificationEmail',
      DefaultTemplateData:
        '{ "teamName":"<null>", "opponentName": "<null>",  "dateTime": "<null>", "firstName":"<null>" }',
    };
    const sentEmails = [];
    players.forEach((player) => {
      if (player.sendEmail) {
        const playerParams = {
          Destination: {
            ToAddresses: [player.email],
          },
          ReplacementTemplateData: `{ "teamName":"${data.teamName}", "opponentName":"${data.opponentName}",  "dateTime": "${data.dateTime}", "firstName":"${player.firstName}"}`,
        };
        params.Destinations.push(playerParams);
        sentEmails.push(player);
      }
    });
    const sesReturn = params.Destinations.length > 0 ? ses.sendBulkTemplatedEmail(params).promise() : {};
    return sesReturn;
  },

  sendStatusEmail: (players, data, gameId) => {
    // https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/ses-examples-sending-email.html
    // template currently is gameNotificationEmail
    // "TemplateData": "{ \"teamName\":\"Alejandro\", \"opponentName\": \"alligator\",  \"dateTime\": \"alligator\",  \"statusLink\": \"alligator\", \"firstName\":\"Alejandro\" }"

    const params = {
      Destinations: [],
      Source: 'Team Status <doNotReply@wvandolah.com>',
      // this would be where to setup what to do after email is sent.
      // ConfigurationSetName: 'failedEmail',
      Template: 'gameNotificationEmail',
      DefaultTemplateData:
        '{ "teamName":"<null>", "opponentName": "<null>",  "dateTime": "<null>",  "statusLink": "<null>", "firstName":"<null>" }',
    };

    const sentEmails = [];
    players.forEach((player) => {
      if (player.sendEmail) {
        const message = `https://teamstatus.wvandolah.com/statusUpdate?t=${data.teamId}&g=${gameId}&p=${player.id}`;
        const playerParams = {
          Destination: {
            ToAddresses: [player.email],
          },
          ReplacementTemplateData: `{ "teamName":"${data.teamName}", "opponentName":"${data.opponentName}",  "dateTime": "${data.dateTime}",  "statusLink": "${message}", "firstName":"${player.firstName}"}`,
        };
        params.Destinations.push(playerParams);
        sentEmails.push(player);
      }
    });

    const sesReturn = params.Destinations.length > 0 ? ses.sendBulkTemplatedEmail(params).promise() : {};
    // const sesReturn = {};
    return { sesReturn, sentEmails };
  },
};
