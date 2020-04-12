'use strict';
const uuid = require('uuid');
module.exports = {
  parseEvent: (event) => {
    return {
      data: JSON.parse(event.body),
      response: {},
      statusCode: '',
    };
  },
  checkNumbers: (players) => {
    const invalidNumbers = [];
    const validNumbers = [];
    players.forEach((player) => {
      const onlyNumber = player.number.replace(/\D/g, '');
      if (onlyNumber.length !== 10) {
        invalidNumbers.push(player);
      } else {
        validNumbers.push({ name: player.name, number: onlyNumber, id: uuid.v4() });
      }
    });
    return { invalidNumbers, validNumbers };
  },
  setResponse: (statusCode, body, request) => {
    return {
      statusCode: statusCode,
      body: JSON.stringify({
        response: body,
        request: request,
      }),
    };
  },
};
