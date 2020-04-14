'use strict';

const dynamodb = require('../config/dynamodb');

module.exports = {
  createTeamPlayerRecord: (record) => {
    const params = {
      TableName: process.env.tableTeamPlayers,
      Item: record,
    };
    return dynamodb.put(params).promise();
  },
  searchTeamPlayerRecord: (record) => {
    const { userId, teamId } = record;
    let keyString = 'userId = :userId';
    const expressionAttObj = {
      ':userId': userId,
    };
    if (teamId) {
      keyString += ' and teamId = :teamId';
      expressionAttObj[':teamId'] = teamId;
    }
    const params = {
      TableName: process.env.tableTeamPlayers,
      KeyConditionExpression: keyString,
      ExpressionAttributeValues: expressionAttObj,
    };
    return dynamodb.query(params).promise();
  },
  deleteTeamPlayerRecord: (record) => {
    const key = {
      teamId: record.teamId,
      userId: record.userId,
    };
    const params = {
      TableName: process.env.tableTeamPlayers,
      Key: key,
      ReturnValues: 'ALL_OLD',
    };
    return dynamodb.delete(params).promise();
  },
};
