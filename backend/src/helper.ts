import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Attendance, CheckedNumbers, ParsedEvent, Player } from '../../common/models';

export const sendStatusTypes = {
  NEW_GAME: 0,
  DELETE_GAME: 1,
};
export const parseEvent = (event: APIGatewayProxyEvent): ParsedEvent => {
  return {
    data: JSON.parse(event.body),
    queryParams: event.queryStringParameters,
  };
};
export const checkNumbers = (players: Player[]): CheckedNumbers => {
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
};
export const sumAttendance = (players: Player[]): Attendance => {
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
};

export const setResponse = (statusCode: number, body, request): APIGatewayProxyResult => {
  return {
    statusCode: statusCode,
    headers: {
      'Access-Control-Allow-Origin': `https://${process.env.domainName}`,
      'Access-Control-Allow-Credentials': true,
    },

    body: JSON.stringify({
      response: body,
      request: request,
    }),
  };
};
