'use strict';
const { setResponse, parseEvent } = require('../helper');
const {
  createTeamPlayerRecord,
  searchTeamPlayerRecord,
  deleteTeamPlayerRecord,
} = require('../service/teamPlayers.service');

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
module.exports.create = async (event) => {
  let { data, response, statusCode } = parseEvent(event);
  try {
    if ('userId' in data && 'teamId' in data && 'players' in data && data.players.length > 0) {
      const record = {
        userId: data.userId,
        teamId: data.teamId,
        players: data.players,
        teamName: data.teamName,
      };
      statusCode = 201;
      await createTeamPlayerRecord(record);
      response = record;
    } else {
      response = {
        error: 'All needed information not provided',
      };
      statusCode = 400;
    }
  } catch (err) {
    console.error(err);
    statusCode = 500;
    response = {
      error: err.message,
    };
  }
  return setResponse(statusCode, response, data);
};

module.exports.search = async (event) => {
  let { queryParams, response, statusCode } = parseEvent(event);
  try {
    if (queryParams && 'userId' in queryParams) {
      statusCode = 200;
      response = await searchTeamPlayerRecord(queryParams);
    } else {
      statusCode = 400;
      response = {
        error: 'UserId is required',
      };
    }
  } catch (err) {
    console.error(err);
    statusCode = 500;
    response = {
      error: err.message,
    };
  }
  return setResponse(statusCode, response, queryParams);
};

module.exports.delete = async (event) => {
  let { queryParams, response, statusCode } = parseEvent(event);
  try {
    if ('userId' in queryParams && 'teamId' in queryParams) {
      statusCode = 200;
      response = await deleteTeamPlayerRecord(queryParams);
    } else {
      statusCode = 400;
      response = {
        error: 'userId and teamId is required',
      };
    }
  } catch (err) {
    console.error(err);
    statusCode = 500;
    response = {
      error: err.message,
    };
  }
  return setResponse(statusCode, response, queryParams);
};
