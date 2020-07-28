'use strict';

const { setResponse, parseEvent, sendStatusTypes } = require('../helper');
const { sendNotifications, sendStatusEmail } = require('../service/sendStatus.service');
const { createStatusRecord } = require('../service/statusDB.service');
const shortid = require('shortid');

module.exports.sendStatusRequest = async (event) => {
  const { data } = parseEvent(event);
  let statusCode = 201;
  let response = {};
  try {
    if (data.players && data.players.length > 0 && 'teamId' in data && 'dateTime' in data) {
      const gameId = shortid.generate();
      await sendNotifications({ ...data, gameId: gameId }, sendStatusTypes.NEW_GAME);

      const { sesReturn } = sendStatusEmail(data.players, data, gameId);
      await sesReturn;
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
      // Returned values will be in order of the Promises passed, regardless of completion order.
      const result = buildResults({ ...data, gameId: gameId });
      await createStatusRecord(result);
      response = { result };
    } else {
      statusCode = 400;
      response = {
        error: 'Not all required data was provided',
      };
    }
  } catch (err) {
    console.log(err);
    console.warn(JSON.stringify(err));
    statusCode = 500;
    response.error = err;
  }
  return setResponse(statusCode, response, data);
};

module.exports.resendStatusRequest = async (event) => {
  const { data } = parseEvent(event);
  let statusCode = 201;
  let response = {};
  try {
    if (data.players && data.players.length > 0 && 'teamId' in data && 'dateTime' in data) {
      await sendNotifications(data, sendStatusTypes.NEW_GAME);
      const { sesReturn } = sendStatusEmail(data.players, data, data.gameId);
      await sesReturn;
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
      // Returned values will be in order of the Promises passed, regardless of completion order.
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
    response.error = err;
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
    result.players[player.id] = { ...player, status: null };
  });
  return result;
};
