'use strict';

import { TeamPlayer, TeamPlayerQueryOutput, TeamPlayerUpdateOutput } from '../../../common/models';
import { dynamodb } from '../config/dynamodb';

export const createTeamPlayerRecord = (record: TeamPlayer): Promise<TeamPlayerUpdateOutput> => {
  const params = {
    TableName: process.env.tableTeamPlayers,
    Item: record,
  };
  return dynamodb.put(params).promise();
};

export const searchTeamPlayerRecord = (record: TeamPlayer): Promise<TeamPlayerQueryOutput> => {
  const { userId, teamId } = record;
  let keyString = 'userId = :userId';
  const expressionAttObj = {
    ':userId': userId,
  };
  if (teamId) {
    keyString += ' and teamId = :teamId';
    expressionAttObj[':teamId'] = teamId;
  }
  if (!userId) {
    throw new Error('User information not provided');
  }
  const params = {
    TableName: process.env.tableTeamPlayers,
    KeyConditionExpression: keyString,
    ExpressionAttributeValues: expressionAttObj,
  };
  return dynamodb.query(params).promise();
};

export const deleteTeamPlayerRecord = (record: TeamPlayer): Promise<TeamPlayerUpdateOutput> => {
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
};
