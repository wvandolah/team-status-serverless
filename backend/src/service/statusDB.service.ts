import type { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import {
  StatusUpdateOutput,
  Status,
  StatusQueryOutput,
  StatusUpdateInput,
  SearchStatus,
  SearchStatuses,
} from '../../../common/models';
import { dynamodb } from '../config/dynamodb';

export const createStatusRecord = (record: Status): Promise<StatusUpdateOutput> => {
  const params = {
    TableName: process.env.tableGameAttendants,
    Item: record,
  };
  return dynamodb.put(params).promise();
};
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
export const searchStatusRecord = (searchParams: SearchStatus | SearchStatuses): Promise<StatusQueryOutput> => {
  const { teamId, historic } = searchParams;
  const returnHistoric = historic === 'true';

  if (!teamId) {
    throw new Error('Team information not provided');
  }
  const currentDate = new Date().toISOString();
  const params: DocumentClient.QueryInput = {
    TableName: process.env.tableGameAttendants,
    KeyConditionExpression: 'teamId = :teamId',
    ExpressionAttributeValues: {
      ':teamId': teamId,
    },
  };

  if (!returnHistoric) {
    params.ExpressionAttributeNames = {
      '#gameTime': 'dateTime',
    };
    params.ExpressionAttributeValues[':searchDate'] = currentDate;
    params.FilterExpression = '#gameTime >= :searchDate';
  }

  if ('playerId' in searchParams) {
    const playerId = searchParams.playerId;
    params.ExpressionAttributeValues[':playerId'] = playerId;
    params.FilterExpression = returnHistoric
      ? '#players.#player.#playerId = :playerId'
      : '#gameTime >= :searchDate AND #players.#player.#playerId = :playerId';

    params.ExpressionAttributeNames = {
      ...params.ExpressionAttributeNames,
      '#players': 'players',
      '#player': playerId,
      '#playerId': 'id',
    };
  }
  return dynamodb.query(params).promise();
};

export const deleteStatusRecord = (deleteParams: Status): Promise<StatusUpdateOutput> => {
  const { teamId, gameId } = deleteParams;
  const key = {
    teamId: teamId,
    gameId: gameId,
  };
  const params = {
    TableName: process.env.tableGameAttendants,
    Key: key,
    ReturnValues: 'ALL_OLD',
  };
  return dynamodb.delete(params).promise();
};

export const updatePlayerStatusRecord = (updateParams: StatusUpdateInput): Promise<StatusUpdateOutput> => {
  const { teamId, gameId, playerId, updateField, updateValue } = updateParams;
  const key = {
    teamId: teamId,
    gameId: gameId,
  };
  const attributeToUpdate = updateField;
  const attributeValueToUpdate = updateValue;
  const expressionAttNames = {
    '#pl': 'players',
    '#plToUpdate': playerId,
    '#st': attributeToUpdate,
  };

  const params = {
    TableName: process.env.tableGameAttendants,
    Key: key,
    UpdateExpression: 'SET #pl.#plToUpdate.#st = :stUpdate',
    ExpressionAttributeNames: expressionAttNames,
    ExpressionAttributeValues: { ':stUpdate': attributeValueToUpdate },
    ReturnValues: 'ALL_NEW',
  };
  return dynamodb.update(params).promise();
};
