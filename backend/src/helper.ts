import { APIGatewayProxyResult } from 'aws-lambda';
import { APIEvent, Attendance, ParsedEvent, Player } from '../../common/models';

export const parseEvent = <TBody, TParams>(event: APIEvent<TParams>): ParsedEvent<TBody, TParams> => {
  return {
    data: JSON.parse(event.body),
    queryParams: event.queryStringParameters,
  };
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
