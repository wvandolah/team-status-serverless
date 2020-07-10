'use strict';

const { searchStatusRecord, deleteStatusRecord, updatePlayerStatusRecord } = require('../service/statusDB.service');
const { setResponse, parseEvent, sumAttendance } = require('../helper');
const { sendDeleteSMS, sendDeleteEmail } = require('../service/sendStatus.service');

module.exports.searchStatus = async (event) => {
  let { queryParams, response, statusCode } = parseEvent(event);

  try {
    statusCode = 200;
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
  let { queryParams, response, statusCode } = parseEvent(event);

  try {
    statusCode = 200;
    response = await searchStatusRecord(queryParams);
    if (response.Count > 0) {
      response.Items[0]['attendance'] = sumAttendance(Object.values(response.Items[0].players));
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
  let { data, response, statusCode } = parseEvent(event);
  try {
    if ('teamId' in data && 'gameId' in data) {
      statusCode = 200;
      response = await deleteStatusRecord(data);
      const gameTime = new Date(response.Attributes.dateTime);
      const toSendSms = [];
      const toSendEmail = [];
      Object.values(response.Attributes.players).forEach((player) => {
        if (player.sendEmail) {
          toSendEmail.push(player);
        }
        if (player.sendText) {
          toSendSms.push(player);
        }
      });

      if (new Date() < gameTime) {
        await Promise.all(
          toSendSms.map((player) => {
            return sendDeleteSMS(player, response.Attributes);
          }),
        );
        const sesReturn = await sendDeleteEmail(toSendEmail, response.Attributes);
        console.warn('here', sesReturn);
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
    console.warn(JSON.stringify(err));
    statusCode = 500;
    response = {
      error: err.message,
    };
  }
  return setResponse(statusCode, response, data);
};
