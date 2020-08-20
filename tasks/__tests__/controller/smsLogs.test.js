/* eslint-disable no-unused-vars */
const { failedSms } = require('../../src/controller/smsLogs');
const { snsEventSave, snsEventQuery } = require('../../src/service/notificationEventsDb');
const { SNS } = require('aws-sdk');

// event will be a base64 zip file
// { awslogs:
//  { data:
// 'H4sIAAAAAAAAAGVT0W6bMBT9FeSHvaxuMdjGGgBVovy+WvzXVRLG+v0QXqX5wZocxJLkTGiYhzBuW2392O/WEAxDt/dfDYSB8wufq772ptR6PC/aFurd+X/f2+d+broauBcaYowmhkBxwq4TwXiuM4FQpTzTnOWZziRiZc59w0QlIY8Yfaq9EOwfbuxrbBjB4tfqKd7IwMwTgtXQjSP3uszRHfSNsaXXT+S7/zxX+jq7Y/6O8yqD3gBP+gj+LmMYvFliboabZ3fTQuTAqvyGpwmTJOMhFnKWdpLihlST6tm1FKRcrihBHG8ml5lghKkpzmKVTE5DxYSDnIDgIjLM8Iy7IkpjS++Egf6F8r5PpgG6vk5LJCC6i8w3caXiukE0Wbpq4xr5sEM01SnNdaYilIpmvGspqYCl1Uf/TmsSROYhwLTEhE6IImC5pd8oRU6A1atWnt0Yyns94w3Wglx9GacZ5dlp/KaNPXtrXhNHN3TgECF4ZnN1/zW7M527yXY/ATOPP6YN3HKhX6TMBkDsHxjM08w2iVuXPbYg14fBnHnDIo+85Pn+I8U47SeakmDtmexdUknhIyE/RHq834YPzQO38eeXcS7aWPamNcJJUyQzA6qk/RvN3Mo19M25aQ0mb2m5F/a1sXbLs2R3C4VM/QkcExGZnygljDwc9axXa1gj8FckRvT2+/AX57S5FKAwAA' } }
// let buff = new Buffer.from(data, 'base64');
// const logevents = JSON.parse(zlib.unzipSync(buff).toString())
// will turn into object that looks like
// {
//   messageType: 'DATA_MESSAGE',
//   owner: '619887618095',
//   logGroup: 'sns/us-east-1/619887618095/DirectPublishToPhoneNumber',
//   logStream: '5d3b40ed-11d4-4cf4-9212-907f2af79295',
//   subscriptionFilters: [
//     'gameattendanttasks-dev-FailedSmsLogsSubscriptionFilterCloudWatchLog1-Y4V8FV708U42'
//   ],
//   logEvents: [
//     {
//       id: '35617103049281018062579949611669365811856796239944155136',
//       timestamp: 1597126137813,
//       message: '{"notification":{"messageId":"0486ea62-245b-5bc2-842c-bdce11872257","timestamp":"2020-08-11 05:58:52.488"},"delivery":{"phoneCarrier":"AT&T Mobility","mnc":180,"numberOfMessageParts":1,"destination":"+18179398675","priceInUSD":0.00645,"smsType":"Transactional","mcc":311,"providerResponse":"Message has been accepted by phone","dwellTimeMs":200,"dwellTimeMsUntilDeviceAck":602876},"status":"SUCCESS"}'
//     }
//   ]
// }

const validSuccessEvent = {
  awslogs: {
    data: `eJxlU9Fq2zAU/ZWgh72saiXZkuW8haQthWUrtdMxljJk+SYRteVgKSmh9N937bRsY+AH+9x7zzn3SH4lLYRgtlCe9kCmZDErZ7+W10Uxu70mF6R78dAjrHiudaa4ZrlEuOm2t3132GMl+HB1CBRMiJRf/d13tXA92Hh/
qBoXdmV3v+s8fD20FTKOFEXswbTIIeukShnUlPM6pandpDQXXNCcZRthNlkuRtVwqILt3T66zt+4JkIfyP
Qn2ZoWTIzga+NjNOE50BqO9Ma4BuqiDV+6bSj+G5033aH+bqLdYZ3TH+mjvnnMmF6lgjyN9q6P4OOg8Epc
jS4TqXjGWcLSXGjOcEclZJbnaa44VypPlNSca6myXIkE8ZRLyROFzqPDlKNpMTAu84wLxZNM8+TiI32kf1
0T30W3cdYMLtdkish7+a7GzzVhqVZglKAilRWVlRVUp8LSqraAyplAP2tysf6jN44JJhhlGtOdMDmVeirF
Zar1mrxhaw2NO0J/OuvthzOam7530I+zs/JTOVl2lWtcPI3crbdYwe3x3Y+n+W2zPNu8N30MQ3HkDdH5j1
XW5DPXHM80GZ6RZ987C3d+VSywzi4ZU6lEOLRhuIrjTNkbH4wdOExzFreDeML5SNAdXQ39A4R958N55N3J
ZGfCpALwE2Mt7CPUk+o0GbcbeeoXaJoSU1oOfgVj/2IrH12zgCM6nNln7FBM4LUe8sJY4yGMWsVqPsc/BX
Mkb09vvwFLOQXi`,
  },
};
const validFailedEvent = {
  awslogs: {
    data: `eJxlUmFP2zAQ/SuRvw4Xn+04dr91tEWVgFWkZZpWNLmJWywSJ4qdIoT47zjp0DbtW/zu7r137/KGauO9PprNa2vQFM1nm9mv20Wez64X6AI1L850ERagpMwESKLSCFfN8bpr+jZWvPOXvcdG+4Dh8u++y7ntTBHW/b6y/mnTrJ8aZ+76eh8ZR4o8dEbXkSMt2Z4TU2KAkmNeHDhWFChWJDtQfcgUHVV9v/dFZ9tgG7e0VTCdR9Of6Khro0MwrtQuBO2fPS7NCS+1rUyZ1/6mOfr8v9GrqunL7zoUT7EO+Ad/kMuHjMgtp+hxtLc4GRcGhTdky+iSpQIyIIxwRSWQuKOgaaYUVwJACMVEKgFkKjIlKIs4hzQFJqLzYGPKQdcxMEhVBlQAyySwi8/0I/3bDrkm2IMt9OByh6YR+V1elfG5QwYORArgmGlicCo5wzqDFJew33MptT4YtUMXuz964xgllGAiMbAExDTlUyonGU936D22lqayJ9O9nvXa4UZXuuus6cbZfH2/utskeRsv2fV1cjNZT0aJ2hWxQUoSv9141G+H27Pbte6Cj0UY6X2w7nOjHfoCQlJOFQfKRp62s4VZuW0+j3UyIUTwNMK+9sMfOc5sOu28LgYOXZ3Fi0GcAYwEzcmWprs3vm2cP498rZri2ZSJ9olvdZ3sX5NxtaT43G3w9mKqahOjuh3csgz+xbYu2GpuTtHfrHge9mGKDZHFZEPvR53lbHWzvV/EKNH74/sHreMHKA==`,
  },
};
const validSuccessEventMsgs = [
  {
    notification: {
      messageId: '0486ea62-245b-5bc2-842c-bdce11872257',
      timestamp: '2020-08-11 05:58:52.488',
    },
    delivery: {
      phoneCarrier: 'AT&T Mobility',
      mnc: 180,
      numberOfMessageParts: 1,
      destination: '+18121231231',
      priceInUSD: 0.00645,
      smsType: 'Transactional',
      mcc: 311,
      providerResponse: 'Message has been accepted by phone',
      dwellTimeMs: 200,
      dwellTimeMsUntilDeviceAck: 602876,
    },
    status: 'SUCCESS',
  },
];

const validFailedEventMsgs = [
  {
    notification: {
      messageId: 'e1f08614-3a0e-5843-a715-d1bb488aafe9',
      timestamp: '2020-08-13 16:54:28.745',
    },
    delivery: {
      phoneCarrier: 'SPRINT Spectrum L.P.',
      mnc: 880,
      numberOfMessageParts: 1,
      destination: '+16824294123',
      priceInUSD: 0.00645,
      smsType: 'Transactional',
      mcc: 311,
      providerResponse: 'Blocked as spam by phone carrier',
      dwellTimeMs: 371,
      dwellTimeMsUntilDeviceAck: 1393,
    },
    status: 'FAILURE',
  },
];

jest.mock('aws-sdk', () => {
  const mockedSNS = {
    publish: jest.fn().mockReturnThis(),
    promise: jest.fn().mockReturnValue({
      ResponseMetadata: {
        RequestId: 'message',
      },
      MessageId: 'da5a27f3-a831-5158-8594-70f62df89f77',
    }),
  };

  return {
    SNS: jest.fn(() => mockedSNS),
  };
});

describe('smsLogs', () => {
  const validInput = {
    teamInfo: { teamName: 'testing2s', dateTime: '7/30/2020, 3:44:31 PM', teamId: 'VyXY1ikPw', gameId: 'gameId' },
    players: [
      {
        phoneNumber: '8179391234',
        playerId: 'ZV0xu8M1p',
        snsMessageId: 'e1f08614-3a0e-5843-a715-d1bb488aafe9',
      },
    ],
    statusType: 0,
    retries: 0,
  };
  const validInput2 = {
    teamInfo: { teamName: 'testing2s', dateTime: '7/30/2020, 3:44:31 PM', teamId: 'VyXY1ikPw', gameId: 'gameId' },
    players: [
      {
        phoneNumber: '8179391234',
        playerId: 'ZV0xu8M1p',
        snsMessageId: '0486ea62-245b-5bc2-842c-bdce11872257',
      },
    ],
    statusType: 0,
    retries: 0,
  };
  const maxTries = {
    teamInfo: { teamName: 'testing2s', dateTime: '7/30/2020, 3:44:31 PM', teamId: 'VyXY1ikPw', gameId: 'gameId' },
    players: [
      {
        phoneNumber: '8179391234',
        playerId: 'ZV0xu8M1p',
        snsMessageId: 'e1f08614-3a0e-5843-a715-d1bb488aafe9',
      },
    ],
    statusType: 0,
    retries: 3,
  };

  describe('given a valid base64 zip', () => {
    test('it decodes and returns logEvent messages array', async () => {
      await snsEventSave(validInput2);
      const actual = await failedSms(validSuccessEvent);
      expect(actual).toEqual(validSuccessEventMsgs);
    });
    test('it should resent and update send count for event if status is FAILURE', async () => {
      await snsEventSave(validInput);
      const actual = await failedSms(validFailedEvent);
      const newSaved = await snsEventQuery('da5a27f3-a831-5158-8594-70f62df89f77');
      expect(actual).toEqual(validFailedEventMsgs);
      expect(newSaved).toEqual({
        Count: 1,
        Items: [
          {
            player: {
              phoneNumber: '8179391234',
              playerId: 'ZV0xu8M1p',
              snsMessageId: 'da5a27f3-a831-5158-8594-70f62df89f77',
            },
            retries: 1,
            snsMessageId: 'da5a27f3-a831-5158-8594-70f62df89f77',
            statusType: 0,
            teamInfo: {
              dateTime: '7/30/2020, 3:44:31 PM',
              gameId: 'gameId',
              teamId: 'VyXY1ikPw',
              teamName: 'testing2s',
            },
          },
        ],
        ScannedCount: 1,
      });
    });
    test('it should not send on FAILURE if after 3rd try', async () => {
      await snsEventSave(maxTries);
      const actual = await failedSms(validFailedEvent);
      expect(actual).toBe('max retries reach');
    });
  });
});
