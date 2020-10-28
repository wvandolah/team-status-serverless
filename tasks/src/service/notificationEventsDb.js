'use strict';
const dynamodb = require('../config/dynamodb');

module.exports = {
  snsEventSave: (snsEvent) => {
    const putItems = snsEvent.players.map((player) => {
      return {
        PutRequest: {
          Item: {
            teamInfo: snsEvent.teamInfo,
            player: player,
            statusType: snsEvent.statusType,
            snsMessageId: player.snsMessageId,
            retries: snsEvent.retries ? snsEvent.retries : 0,
          },
        },
      };
    });
    const params = {
      RequestItems: {
        [process.env.tableNotificationEvents]: putItems,
      },
    };
    return dynamodb.batchWrite(params).promise();
  },
  snsEventQuery: (snsId) => {
    const params = {
      TableName: process.env.tableNotificationEvents,
      KeyConditionExpression: 'snsMessageId = :snsMessageId',
      ExpressionAttributeValues: {
        ':snsMessageId': snsId,
      },
    };
    return dynamodb.query(params).promise();
  },
};
