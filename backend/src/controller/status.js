'use strict';

const { searchStatusRecord, deleteStatusRecord, updatePlayerStatusRecord } = require('../service/statusDB.service');
const { sendStatusTypes, setResponse, parseEvent, sumAttendance } = require('../helper');
const { sendNotifications, sendDeleteEmail } = require('../service/sendStatus.service');

module.exports.searchStatus = async (event) => {
  const { queryParams } = parseEvent(event);
  let response = {};
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
      response = {};
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

module.exports.searchStatuses = async (event) => {
  const { queryParams } = parseEvent(event);
  let response = {};
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

module.exports.deleteStatus = async (event) => {
  const { data } = parseEvent(event);
  let response = {};
  let statusCode = 200;
  try {
    if ('teamId' in data && 'gameId' in data) {
      response = await deleteStatusRecord(data);
      const gameTime = new Date(response.Attributes.dateTime);
      const toSendEmail = [];
      Object.values(response.Attributes.players).forEach((player) => {
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

module.exports.updatePlayerStatus = async (event) => {
  let { data } = parseEvent(event);
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
