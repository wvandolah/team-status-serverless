'use strict';

const { checkNumbers, setResponse, parseEvent } = require('../helper');
const { sendStatusSMS, sendStatusEmail } = require('../service/sendStatus.service');
const { createStatusRecord, updatePlayerStatusRecord } = require('../service/statusDB.service');
const shortid = require('shortid');

/**
 * example request
{
	"team": "someUUIDForTeams",
	"game": "someUUIDForGame2",
	"dateTime": "12/12/2020 at 7:30pm",
	"teamName": "below C",
	"players": [{
		"number": "8179398674",
		"name": "playerName1"
	},{
		"number": "8179398673",
		"name": "playerName2"
	},{
		"number": "8179398675",
		"name": "playerName3"
	}]
}
 */
module.exports.sendStatusRequest = async (event) => {
  const { data } = parseEvent(event);
  let statusCode = 201;
  let response = {};
  try {
    if (data.players && data.players.length > 0 && 'teamId' in data && 'dateTime' in data) {
      const gameId = shortid.generate();
      const { invalidNumbers, validNumbers } = checkNumbers(data.players);
      const smsPromiseResult = await Promise.all(validNumbers.map((player) => sendStatusSMS(player, data, gameId)));
      const { sesReturn, sentEmails } = sendStatusEmail(data.players, data, gameId);
      const awaitedSes = await sesReturn;
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
      // Returned values will be in order of the Promises passed, regardless of completion order.
      const result = {
        teamId: data.teamId,
        gameId: gameId,
        opponentName: data.opponentName,
        teamName: data.teamName,
        dateTime: data.dateTime,
        players: {},
      };
      validNumbers.forEach((player, i) => {
        result.players[player.id] = { ...player, snsMessageId: smsPromiseResult[i].MessageId, status: null };
      });
      sentEmails.forEach((player) => {
        if (!result.players[player.id]) {
          result.players[player.id] = { ...player, status: null };
        }
      });
      // bulk ses returnes and array of statuses, but the order is not guaranteed.
      result['bulkEmailDestinationStatus'] = awaitedSes;
      await createStatusRecord(result);
      response = { invalidNumbers, result };
    } else {
      statusCode = 500;
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

module.exports.resendStatusRequest = async (event) => {
  const { data } = parseEvent(event);
  let statusCode = 201;
  let response = {};
  try {
    if (data.players && data.players.length > 0 && 'teamId' in data && 'dateTime' in data) {
      const { invalidNumbers, validNumbers } = checkNumbers(data.players);
      const promiseResult = await Promise.all(validNumbers.map((player) => sendStatusSMS(player, data, data.gameId)));
      const { sesReturn, sentEmails } = sendStatusEmail(data.players, data, data.gameId);
      await sesReturn;
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
      // Returned values will be in order of the Promises passed, regardless of completion order.
      const result = {
        teamId: data.teamId,
        gameId: data.gameId,
        opponentName: data.opponentName,
        teamName: data.teamName,
        dateTime: data.dateTime,
        players: {},
      };
      validNumbers.forEach((player, i) => {
        result.players[player.id] = { ...player, snsMessageId: promiseResult[i].MessageId, status: null };
      });
      sentEmails.forEach((player) => {
        if (!result.players[player.id]) {
          result.players[player.id] = { ...player, status: null };
        }
      });
      await Promise.all(
        Object.values(result.players).map((player) =>
          updatePlayerStatusRecord({ ...player, gameId: data.gameId, teamId: data.teamId, playerId: player.id }),
        ),
      );
      response = { invalidNumbers, result };
    } else {
      statusCode = 500;
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
