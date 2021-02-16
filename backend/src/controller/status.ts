import { searchStatusRecord, deleteStatusRecord, updatePlayerStatusRecord } from '../service/statusDB.service';
import { sendStatusTypes, setResponse, parseEvent, sumAttendance } from '../helper';
import type {
  StatusUpdateOutput,
  Player,
  StatusQueryOutput,
  APIEvent,
  SearchStatus,
  UpdatePlayerStatusBody,
  SearchStatuses,
} from '../../../common/models';
import { sendNotifications, sendDeleteEmail } from '../service/sendStatus.service';
import type { APIGatewayProxyResult } from 'aws-lambda';

export const searchStatus = async (event: APIEvent<SearchStatus>): Promise<APIGatewayProxyResult> => {
  const { queryParams } = parseEvent<unknown, SearchStatus>(event);
  let response: StatusQueryOutput;
  let statusCode = 200;
  try {
    console.info('Searching player Status for: ', JSON.stringify(queryParams));
    response = await searchStatusRecord(queryParams);
    if (response.Count > 0 && response.Items[0].players[queryParams.playerId]) {
      const attendance = sumAttendance(Object.values(response.Items[0].players));
      response.Items[0]['attendance'] = attendance;
      response.Items[0].players = {
        [queryParams.playerId]: { ...response.Items[0].players[queryParams.playerId] },
      };
    } else {
      response = { Count: 0 };
    }
  } catch (err) {
    console.warn(JSON.stringify(err));
    statusCode = 500;
    response = {
      error: err.message,
    };
  }

  return setResponse(statusCode, response, queryParams);
};

export const searchStatuses = async (event: APIEvent<SearchStatuses>): Promise<APIGatewayProxyResult> => {
  const { queryParams } = parseEvent<unknown, SearchStatuses>(event);
  let response: StatusQueryOutput;
  let statusCode = 200;
  try {
    response = await searchStatusRecord(queryParams);
    if (response.Count > 0) {
      for (let i = 0; i < response.Count; i++) {
        response.Items[i]['attendance'] = sumAttendance(Object.values(response.Items[i].players));
      }
    }
  } catch (err) {
    console.warn(JSON.stringify(err));
    statusCode = 500;
    response = {
      error: err.message,
    };
  }

  return setResponse(statusCode, response, queryParams);
};

export const deleteStatus = async (event: APIEvent<unknown>): Promise<APIGatewayProxyResult> => {
  const { data } = parseEvent<UpdatePlayerStatusBody, unknown>(event);
  let response: StatusUpdateOutput;
  let statusCode = 200;
  try {
    if ('teamId' in data && 'gameId' in data) {
      response = await deleteStatusRecord(data);
      const gameTime = new Date(response.Attributes.dateTime);
      const toSendEmail = [];
      Object.values(response.Attributes.players).forEach((player: Player) => {
        if (player.sendEmail) {
          toSendEmail.push(player);
        }
      });
      response.Attributes.players = Object.values(response.Attributes.players);
      if (new Date() < gameTime) {
        await sendDeleteEmail(toSendEmail, response.Attributes);
        await sendNotifications(response.Attributes, sendStatusTypes.DELETE_GAME);
      }
    } else {
      response = {
        error: 'Team and Game information not provided',
      };
      statusCode = 400;
    }
  } catch (err) {
    console.warn(JSON.stringify(err));
    statusCode = 500;
    response = {
      error: err.message,
    };
  }
  return setResponse(statusCode, response, data);
};

export const updatePlayerStatus = async (event: APIEvent<unknown>): Promise<APIGatewayProxyResult> => {
  const { data } = parseEvent<UpdatePlayerStatusBody, unknown>(event);
  let response = {};
  let statusCode = 201;
  try {
    if ('teamId' in data && 'gameId' in data && 'playerId' in data && 'status' in data) {
      console.info('Player updated status with info: ', JSON.stringify(data));

      response = await updatePlayerStatusRecord({ ...data, updateField: 'status', updateValue: data.status });
    } else {
      console.warn('failed to update status: ', JSON.stringify(data));
      response = {
        error: 'Team, Game, playerNumber and status information not provided',
      };
      statusCode = 400;
    }
  } catch (err) {
    console.warn(JSON.stringify(err));
    statusCode = 500;
    response = {
      error: err.message,
    };
  }
  return setResponse(statusCode, response, data);
};
