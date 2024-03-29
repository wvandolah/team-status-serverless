import { setResponse, parseEvent } from '../helper';
import { sendNotifications, sendStatusEmail } from '../service/sendStatus.service';
import { createStatusRecord, updatePlayerStatusRecord } from '../service/statusDB.service';
import * as shortid from 'shortid';
import { APIGatewayProxyResult } from 'aws-lambda';
import {
  APIEvent,
  ResponseError,
  SearchStatus,
  StatusUpdateBody,
  Status,
  sendStatusTypes,
} from '../../../common/models';

export const sendStatusRequest = async (event: APIEvent<StatusUpdateBody>): Promise<APIGatewayProxyResult> => {
  const { data } = parseEvent<StatusUpdateBody, unknown>(event);
  let statusCode = 201;
  let response: Status | ResponseError;
  console.info('[sendStatus]: received event: ', data);
  try {
    if (data.players && data.players.length > 0 && 'teamId' in data && 'dateTime' in data) {
      const gameId = data.addPlayer ? data.gameId : shortid.generate();
      await sendNotifications({ ...data, gameId: gameId }, sendStatusTypes.NEW_GAME);
      const { sesReturn } = sendStatusEmail(data.players, data);
      await sesReturn;
      const result = buildResults({ ...data, gameId: gameId });
      if (data.addPlayer) {
        await Promise.all(
          data.players.map((player) => {
            player.smsDelivered = null;
            player.status = null;
            return updatePlayerStatusRecord({
              teamId: data.teamId,
              gameId: gameId,
              playerId: player.id,
              updateField: 'players',
              updateValue: player,
            });
          }),
        );
      } else {
        await createStatusRecord(result);
      }

      response = { ...result };
    } else {
      statusCode = 400;
      response = {
        error: 'Not all required data was provided',
      };
    }
  } catch (err) {
    console.warn('error:', err.message, 'full error', JSON.stringify(err));
    statusCode = 500;
    response = { error: err.message };
  }
  return setResponse(statusCode, response, data);
};

export const resendStatusRequest = async (event: APIEvent<SearchStatus>): Promise<APIGatewayProxyResult> => {
  const { data } = parseEvent<StatusUpdateBody, SearchStatus>(event);
  let statusCode = 201;
  let response = {};
  console.info('[reSendStatus]: received event: ', data);
  try {
    if (data.players && data.players.length > 0 && 'teamId' in data && 'dateTime' in data) {
      await sendNotifications(data, sendStatusTypes.NEW_GAME);
      const { sesReturn } = sendStatusEmail(data.players, data);
      await sesReturn;
      await updatePlayerStatusRecord({
        teamId: data.teamId,
        gameId: data.gameId,
        playerId: data.players[0].id,
        updateField: 'smsDelivered',
        updateValue: '',
      });
      const result = buildResults(data);
      response = { result };
    } else {
      statusCode = 400;
      response = {
        error: 'Not all required data was provided',
      };
    }
  } catch (err) {
    console.warn(JSON.stringify(err));
    statusCode = 500;
    response = { error: err.message };
  }

  return setResponse(statusCode, response, data);
};

const buildResults = (data) => {
  const result = {
    teamId: data.teamId,
    gameId: data.gameId,
    opponentName: data.opponentName,
    teamName: data.teamName,
    dateTime: data.dateTime,
    players: {},
  };
  data.players.forEach((player) => {
    result.players[player.id] = { ...player, status: null, smsDelivered: null };
  });
  return result;
};
