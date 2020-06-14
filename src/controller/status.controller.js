'use strict';

const { searchStatusRecord, deleteStatusRecord, updatePlayerStatusRecord } = require('../service/statusDB.service');
const { setResponse, parseEvent } = require('../helper');
const { sendDeleteSMS } = require('../service/sendStatus.service');

module.exports.searchStatus = async (event) => {
  let { queryParams, response, statusCode } = parseEvent(event);
  try {
    statusCode = 200;
    response = await searchStatusRecord(queryParams);
  } catch (err) {
    console.error(err);
    statusCode = 500;
    response = {
      error: err.message,
    };
  }

  return setResponse(statusCode, response, queryParams);
};

module.exports.deleteStatus = async (event) => {
  let { data, response, statusCode } = parseEvent(event);
  try {
    if ('teamId' in data && 'gameId' in data) {
      statusCode = 200;
      response = await deleteStatusRecord(data);
      await Promise.all(
        Object.values(response.Attributes.players).map((player) => {
          return sendDeleteSMS(player, response.Attributes);
        }),
      );
    } else {
      response = {
        error: 'Team and Game information not provided',
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

module.exports.updatePlayerStatus = async (event) => {
  let { data, response, statusCode } = parseEvent(event);
  try {
    if ('teamId' in data && 'gameId' in data && 'playerId' in data && 'status' in data) {
      statusCode = 201;
      response = await updatePlayerStatusRecord(data);
    } else {
      response = {
        error: 'Team, Game, playerNumber and status information not provided',
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
