'use strict';
module.exports = {
  parseEvent: (event) => {
    return {
      data: JSON.parse(event.body),
      response: {},
      queryParams: event.queryStringParameters,
      statusCode: '',
    };
  },
  checkNumbers: (players) => {
    const invalidNumbers = [];
    const validNumbers = [];
    players.forEach((player) => {
      if (player.sendText) {
        const onlyNumber = player.phoneNumber.replace(/\D/g, '');
        if (onlyNumber.length !== 10) {
          invalidNumbers.push(player);
        } else {
          validNumbers.push({ id: player.id, phoneNumber: onlyNumber, ...player });
        }
      }
    });
    return { invalidNumbers, validNumbers };
  },
  setResponse: (statusCode, body, request) => {
    return {
      statusCode: statusCode,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        response: body,
        request: request,
      }),
    };
  },
  sumAttendance: (players) => {
    return players.reduce(
      (sums, player) => {
        if (player.status === 'In') {
          sums.in++;
        } else if (player.status === 'Out') {
          sums.out++;
        } else {
          sums.noResponse++;
        }

        return sums;
      },
      { in: 0, out: 0, noResponse: 0 },
    );
  },
};
