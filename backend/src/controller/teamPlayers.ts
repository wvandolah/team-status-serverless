import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import type { ResponseError, TeamPlayer, TeamPlayerQueryOutput, TeamPlayerUpdateOutput } from '../../../common/models';
import { setResponse, parseEvent } from '../helper';
import { createTeamPlayerRecord, searchTeamPlayerRecord, deleteTeamPlayerRecord } from '../service/teamPlayers.service';

/**
 * Expected struct.  
 * {
      userId: 'String',
      teamId: 'String',
      players: [{
        name: 'string',
        phoneNumber: 'string',
        email: 'string',
        type: 'string of sub || full || part',
      }]
    }
  * 
 */
export const create = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { data } = parseEvent<TeamPlayer, unknown>(event);
  let response: TeamPlayer | ResponseError;
  let statusCode = 201;
  try {
    if ('userId' in data && 'teamId' in data && 'players' in data && data.players.length > 0) {
      const record: TeamPlayer = {
        userId: data.userId,
        teamId: data.teamId,
        players: data.players,
        teamName: data.teamName,
      };
      await createTeamPlayerRecord(record);
      response = record;
    } else {
      response = {
        error: 'All needed information not provided',
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

export const search = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { queryParams } = parseEvent(event);
  let response: TeamPlayerQueryOutput;
  let statusCode = 200;
  try {
    if (queryParams && 'userId' in queryParams) {
      response = await searchTeamPlayerRecord(queryParams);
    } else {
      statusCode = 400;
      response = {
        error: 'UserId is required',
      };
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

export const deleteTeamPlayer = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { queryParams } = parseEvent(event);
  let response: TeamPlayerUpdateOutput;
  let statusCode = 200;
  try {
    if ('userId' in queryParams && 'teamId' in queryParams) {
      response = await deleteTeamPlayerRecord(queryParams);
    } else {
      statusCode = 400;
      response = {
        error: 'userId and teamId is required',
      };
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
