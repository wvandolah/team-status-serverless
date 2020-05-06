'use strict';

const dynamodb = require('../config/dynamodb');

module.exports = {
  createStatusRecord: (record) => {
    const params = {
      TableName: process.env.tableGameAttendants,
      Item: record,
    };
    return dynamodb.put(params).promise();
  },
  // this works to find a record by team and id in the dynamodb shell
  //   var params = {
  //     TableName: 'game-attendants',
  //     KeyConditionExpression: 'team = :teamVal and id = :id',

  //     ExpressionAttributeValues: { // a map of substitutions for all attribute values
  //       ':teamVal': 'someUUIDForTeams',
  //       ':id': '7e194a47-7709-4c1d-8a38-13d29003476d'
  //     },

  // };
  // docClient.query(params, function(err, data) {
  //     if (err) ppJson(err); // an error occurred
  //     else ppJson(data); // successful response
  // });
  searchStatusRecord: (searchParams) => {
    const { teamId, gameId } = searchParams;
    let keyString = '';
    let expressionAttObj = {};
    if (teamId && gameId) {
      keyString = `teamId = :teamId and gameId = :gameId`;
      expressionAttObj = {
        ':teamId': teamId,
        ':gameId': gameId,
      };
    } else if (teamId && !gameId) {
      keyString = 'teamId = :teamId';
      expressionAttObj = {
        ':teamId': teamId,
      };
    } else {
      throw new Error('Team information not provided');
    }
    const params = {
      TableName: process.env.tableGameAttendants,
      KeyConditionExpression: keyString,
      ExpressionAttributeValues: expressionAttObj,
    };
    return dynamodb.query(params).promise();
  },

  deleteStatusRecord: (deleteParams) => {
    const { team, game } = deleteParams;
    const key = {
      team: team,
      game: game,
    };
    const params = {
      TableName: process.env.tableGameAttendants,
      Key: key,
      ReturnValues: 'ALL_OLD',
    };
    return dynamodb.delete(params).promise();
  },

  updatePlayerStatusRecord: (updateParams) => {
    const { teamId, gameId, playerId, status } = updateParams;
    const key = {
      teamId: teamId,
      gameId: gameId,
    };
    const expressionAttNames = {
      '#pl': 'players',
      '#plToUpdate': playerId,
      '#st': 'status',
    };

    const params = {
      TableName: process.env.tableGameAttendants,
      Key: key,
      UpdateExpression: 'SET #pl.#plToUpdate.#st = :stUpdate',
      ExpressionAttributeNames: expressionAttNames,
      ExpressionAttributeValues: { ':stUpdate': status },
      ReturnValues: 'ALL_NEW',
    };
    return dynamodb.update(params).promise();
  },
};
