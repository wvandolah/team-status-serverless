'use strict';

const { SNS, SES } = require('aws-sdk');
const sns = new SNS({ apiVersion: '2010-03-31' });
const ses = new SES({ apiVersion: '2010-12-01' });

module.exports = {
  sendNotifications: (data, statusType) => {
    const payload = {
      data,
      statusType,
    };
    if (!process.env.IS_OFFLINE) {
      console.log('sending to sendNotificationTopic', data, statusType);
      return sns
        .publish({
          Message: JSON.stringify(payload),
          TopicArn: process.env.sendNotificationTopicArn,
        })
        .promise();
    }
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

    players.forEach((player) => {
      if (player.sendEmail) {
        const playerParams = {
          Destination: {
            ToAddresses: [player.email],
          },
          ReplacementTemplateData: `{ "teamName":"${data.teamName}", "opponentName":"${data.opponentName}",  "dateTime": "${data.dateTime}", "firstName":"${player.firstName}"}`,
        };
        params.Destinations.push(playerParams);
      }
    });
    return params.Destinations.length > 0 ? ses.sendBulkTemplatedEmail(params).promise() : {};
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
