import { SNS, SES, AWSError, Request } from 'aws-sdk';
import { PublishResponse } from 'aws-sdk/clients/sns';
import { PromiseResult } from 'aws-sdk/lib/request';
import { StatusUpdateBody, Status, Player } from '../../../common/models';
const sns = new SNS({ apiVersion: '2010-03-31' });
const ses = new SES({ apiVersion: '2010-12-01' });

export const sendNotifications = (
  data: StatusUpdateBody | Status,
  statusType: number,
): Promise<PromiseResult<PublishResponse, AWSError>> => {
  const payload = {
    data,
    statusType,
  };
  if (!process.env.IS_OFFLINE) {
    console.info('sending to sendNotificationTopic', data, statusType);
    return sns
      .publish({
        Message: JSON.stringify(payload),
        TopicArn: process.env.sendNotificationTopicArn,
      })
      .promise();
  } else {
    console.info('not sending due to being offline', data, statusType);
  }
};
export const sendDeleteEmail = (
  players: Player[],
  data: Status,
): Promise<PromiseResult<SES.SendBulkTemplatedEmailResponse, AWSError>> | Record<string, unknown> => {
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
        ReplacementTemplateData: `{ "teamName":"${data.teamName}", "opponentName":"${
          data.opponentName
        }",  "dateTime": "${new Date(data.dateTime).toLocaleString('en-US', {
          timeZone: 'America/Chicago',
        })}", "firstName":"${player.firstName}"}`,
      };
      params.Destinations.push(playerParams);
    }
  });
  return params.Destinations.length > 0 ? ses.sendBulkTemplatedEmail(params).promise() : {};
};

export const sendStatusEmail = (players: Player[], data: StatusUpdateBody): Record<string, unknown> => {
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
      const message = `http${process.env.IS_OFFLINE ? '' : 's'}://${process.env.domainName}/statusUpdate?t=${
        data.teamId
      }&p=${player.id}`;
      const playerParams = {
        Destination: {
          ToAddresses: [player.email],
        },
        ReplacementTemplateData: `{ "teamName":"${data.teamName}", "opponentName":"${
          data.opponentName
        }",  "dateTime": "${new Date(data.dateTime).toLocaleString('en-US', {
          timeZone: 'America/Chicago',
        })}",  "statusLink": "${message}", "firstName":"${player.firstName}"}`,
      };
      params.Destinations.push(playerParams);
      sentEmails.push(player);
    }
  });

  const sesReturn = params.Destinations.length > 0 ? ses.sendBulkTemplatedEmail(params).promise() : {};
  // const sesReturn = {};
  return { sesReturn, sentEmails };
};
