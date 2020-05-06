'use strict';

const { checkNumbers, setResponse, parseEvent } = require('../helper');
const { sendSMS } = require('../service/sendStatus.service');
const { createStatusRecord } = require('../service/statusDB.service');
const { v4: uuid } = require('uuid');

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
  let { data, response, statusCode } = parseEvent(event);
  try {
    if (data.players && data.players.length > 0 && 'teamId' in data && 'dateTime' in data) {
      const gameId = uuid();
      const { invalidNumbers, validNumbers } = checkNumbers(data.players);
      const promiseResult = await Promise.all(validNumbers.map((player) => sendSMS(player, data, gameId)));

      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
      // Returned values will be in order of the Promises passed, regardless of completion order.
      const result = {
        teamId: data.teamId,
        gameId: gameId,
        teamName: data.teamName,
        dateTime: data.dateTime,
        players: {},
      };
      validNumbers.forEach((player, i) => {
        result.players[player.id] = { ...player, snsMessageId: promiseResult[i].MessageId, status: null };
      });
      await createStatusRecord(result);
      statusCode = 201;
      response = { invalidNumbers, result };
    } else {
      statusCode = 500;
      response = {
        error: 'Not all required data was provided',
      };
    }
  } catch (err) {
    console.error(err);
    statusCode = 500;
    response.error = err;
  }
  return setResponse(statusCode, response, data);
};
