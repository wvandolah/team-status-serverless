'use strict';
const dynamodb = require('../config/dynamodb');

module.exports = {
  updateSmsDeliveryStatus: (teamId, gameId, playerId, smsDelivered) => {
    const key = {
      teamId: teamId,
      gameId: gameId,
    };
    const expressionAttNames = {
      '#pl': 'players',
      '#plToUpdate': playerId,
      '#st': 'smsDelivered',
    };

    const params = {
      TableName: process.env.tableGameAttendants,
      Key: key,
      UpdateExpression: 'SET #pl.#plToUpdate.#st = :stUpdate',
      ExpressionAttributeNames: expressionAttNames,
      ExpressionAttributeValues: { ':stUpdate': smsDelivered },
      ReturnValues: 'ALL_NEW',
    };
    return dynamodb.update(params).promise();
  },
};
