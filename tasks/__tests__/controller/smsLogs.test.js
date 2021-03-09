/* eslint-disable no-unused-vars */
const { failedSms } = require('../../src/controller/smsLogs');
const { snsEventSave, snsEventQuery } = require('../../src/service/notificationEventsDb');
const { searchStatusRecord } = require('../helper');
const { SNS } = require('aws-sdk');
const sns = new SNS({ apiVersion: '2010-03-31', SMS: { smsType: 'Transactional' }, region: 'us-east-1' });

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

const validFailedEvent2 = {
  awslogs: {
    data:
      'H4sIAAAAAAAAAGVSXW/bMAz8K4Ee9rKqkWRbH3kLmqQI0GxFna4YlmKQbToRasuBJKcIiv73yc6KbdgbxSPvTiTfUAve6z1sz0dAM7SYb+c/N8s8n98u0RXqXi24mOZUSSk4lURlMd10+1vX9ceIeOunvcegfcB0+nfddGEclOG+LxrjD9vu/tBZ+NK3BbjpSpumd3ChyoMD3UYuCYrVMuVYCSZwKkBgmUKKq6yoi1pkVMOg7vvCl84cg+nsyjQBnEezH2ivW9AhgK20DUH7F48rOOFBCqq89Xfd3uf/td40XV896VAeIs4wvVvL7+tv+eZ29fSEnkd/yxPYMEi8IVNFm0nGM8YzlSlBEx6jlAnK0pQomQwYl1yRhFAuqWQkyRKVJUIxEq0HE8cddBsnRzMlBSNZKjPOrj7WEOnfdsh2wdSm1IPNHZrFzG94XcXnDkVeUSc6xWWiAWdVkeJCVTXWKSdpXUfJMhZe7f7ojW2MMIKJxExNqJgRNmP0OuFih95jaQWNOYE7X/SOw7JutHMG3Ng7337aTjZdYRoTziN3a8uIxFXH2I5r/VpvLjbvtQt+AEdeH4z9+MoOfaaSCpUoyUU28hydKWFtH/NFxMk1ITzNYtq3frjJsWfrtPW6HDh0cxEvB/GE0pGgO5kK3AP4Y2f9pWW8tonxk7J3Lu6vOU96G++sPOiigWlv9SkexhCPfNUrNM02Tmsz+GaE/5t7tME0CzhFp/PyZfgZJckwtTjc0PtRcTVf3z0+LOM00fvz+y8E1gJ2WQMAAA==',
  },
};

const validFailedEvent3 = {
  awslogs: {
    data:
      'H4sIAAAAAAAAAGVSXW/bIBT9KxEPe1lpwBgDeYuapIrUbFXtrpqWasJAE1QbR4BTRVH/+7Czapv2BvdwPrj3nkFrQpA7U50OBszAYl7Nf26WZTm/XYIr0L0541O5wIJzVmCOBE3lptvd+q4/JCS4MO0DNDJEiKd/v5surDcq3vd1Y8O+6u73nTNf+rY2frqStum9uUiV0RvZJi2aYSQEQxBLxGGOJYMC0QzWkmulqOaSkkQJfR2Ut4doO7eyTTQ+gNkPsJOtkTEap6WLUYbXALU5wsHK6LINd90ulP9Rb5qu108yqn3CM4jv1vz7+lu5uV09PYHnMd/yaFwcLM7A6hST0ILnOU5JOS0yQikuBBMCMZEThlHOC0w4JpSxgjEk8ixjHOW4SNGjTe2Osk2dwwVCOM8ZISTDVx9jSPLnLXBdtC9WySHmFsxS5Te81um6BfiFGCMVgURpBCnBHAqqc1hrLFhNuTaGbMHV9o/fSMtQhiASENMJymeEz0h2XfD08j091aaxR+NPF7/DMKwb6b01fuTOq0/VZNPVtrHxNGq3TiUkjTqd3TjWry+bS8x76WMYwFE3ROs+vrIFnzHHTBDBC0ZHnYO3yqzdY7lIOLpGqMhpKoc2DDs5ciovXZBq0JDNxVwN5gTjUaA7Wm38gwmHzoULZdy2iQ0T1Xuf5tecJr1Le6b2sm7MtHfymBZjOI96+s00TZW6tRlyZ5j+W3t00TYLc0xJ5+p1+BliZOhaam7sw+i4mq/vHh+WqZvg/fn9F4ohmnZZAwAA',
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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('given a valid base64 zip', () => {
    test('it decodes and returns logEvent messages array', async () => {
      const actual = await failedSms(validSuccessEvent);
      expect(actual).toEqual(validSuccessEventMsgs);
    });
    test('it should update tableGameAttendants with success for player', async () => {
      await failedSms(validSuccessEvent);
      const actual = await searchStatusRecord('VyXY1ikPw', 'gameId');
      expect(actual.Items[0].players['ZV0xu8M1p'].smsDelivered).toBe('success');
    });
    test('it should resent and update send count for event if status is FAILURE', async () => {
      const actual = await failedSms(validFailedEvent);
      const newSaved = await snsEventQuery('da5a27f3-a831-5158-8594-70f62df89f77');
      expect(actual).toEqual(validFailedEventMsgs);
      expect(newSaved).toEqual({
        Count: 1,
        Items: [
          {
            player: {
              phoneNumber: '8179391234',
              id: 'ZV0xu8M1p',
              snsMessageId: 'da5a27f3-a831-5158-8594-70f62df89f77',
            },
            retries: 1,
            snsMessageId: 'da5a27f3-a831-5158-8594-70f62df89f77',
            statusType: 0,
            teamInfo: {
              teamName: 'testing2s',
              dateTime: '2021-03-09T06:27:10.502Z',
              teamId: 'VyXY1ikPw',
              gameId: 'gameId',
            },
          },
        ],
        ScannedCount: 1,
      });
    });
    test('it should not send on FAILURE if after 3rd try', async () => {
      const actual = await failedSms(validFailedEvent3);
      expect(actual).toBe('max retries reach');
    });
    test('it update tableGameAttendants with failed after 3rd try', async () => {
      await failedSms(validFailedEvent3);
      const actual = await searchStatusRecord('teamIdFor3rdFailedTest', 'gameIdFor3rdFailedTest');
      expect(actual.Items[0].players['playerIdFor3rdFailedTest'].smsDelivered).toBe('failed');
    });
    test('it should send correct and update send count for event if status is FAILURE', async () => {
      await failedSms(validFailedEvent2);
      expect(sns.publish.mock.calls[0]).toHaveLength(1);
      expect(sns.publish.mock.calls[0][0]).toEqual({
        Message:
          'Confirm your status for A game at 3/9/2021, 12:27:10 AM: https://teamstatus-dev.wvandolah.com/statusUpdate?t=9hie_SVJi&p=_6tVhnSou',
        PhoneNumber: '+18178178171',
      });
    });
  });
});
