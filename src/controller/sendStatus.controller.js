'use strict';

const { checkNumbers, setResponse } = require('../helper');
const { sendSMS } = require('../service/sendStatus.service');
const { createStatusRecord } = require('../service/statusDB.service');

module.exports.sendStatusRequest = async (event) => {
  const data = JSON.parse(event.body);
  let response = {};
  let statusCode = '';
  try {
    if (data.players && data.players.length > 0 && 'team' in data && 'game' in data) {
      const { invalidNumbers, validNumbers } = checkNumbers(data.players);
      const promiseResult = await Promise.all(validNumbers.map((player) => sendSMS(player)));

      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all
      // Returned values will be in order of the Promises passed, regardless of completion order.
      const dbPromiseResult = [];
      const result = validNumbers.map((player, i) => {
        const params = { ...player, snsMessageId: promiseResult[i].MessageId, team: data.team, game: data.game };
        dbPromiseResult.push(createStatusRecord(params));
        return params;
      });
      statusCode = 201;
      response = { invalidNumbers, result };
      await Promise.all(dbPromiseResult);
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
