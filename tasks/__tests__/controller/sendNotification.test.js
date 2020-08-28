/* eslint-disable no-unused-vars */
const { sendSms } = require('../../src/controller/sendNotification');
const { SNS } = require('aws-sdk');
const { snsEventQuery } = require('../../src/service/notificationEventsDb');
const expectedValidEvent = {
  Records: [
    {
      EventSource: 'aws:sns',
      EventVersion: '1.0',
      EventSubscriptionArn:
        'arn:aws:sns:us-east-1:619887618095:gameattendanttasks-dev-send-notification-topic:8e975a3e-6553-448c-98ee-b5f4327eb280',
      Sns: {
        Type: 'Notification',
        MessageId: '0ee0f049-65d7-5c39-b15c-a7d456a2dfc7',
        TopicArn: 'arn:aws:sns:us-east-1:619887618095:gameattendanttasks-dev-send-notification-topic',
        Subject: null,
        Message:
          '{"data": {"teamId":"VyXY1ikPw", "gameId":"gameId", "teamName":"testing2s","opponentName":"","dateTime":"7/30/2020, 3:44:31 PM","players":[{"firstName":"William","lastName":"VanDolah","sendEmail":false,"phoneNumber":"8179391234","id":"ZV0xu8M1p","type":null,"email":"success@simulator.amazonses.com","sendText":true}, {"firstName":"William","lastName":"VanDolah","sendEmail":false,"phoneNumber":"8179391234","id":"ZV0xu8M1p","type":null,"email":"success@simulator.amazonses.com","sendText":false}]},"statusType": 0}',
        Timestamp: '2020-07-30T20:44:37.943Z',
        SignatureVersion: '1',
        Signature:
          'DoSAni26GcqTiiiw1Gaw4GI5HPEqAmdwN9au08wVlm+YkAVQWhbXs7jGQPFBCky8B1qiwKSfE2VTgnFeQ8A/bPbkNKlIdUlk9JSafTB13epfe6LQtfjGP2Vjiln1vJjs9+B6LdcHy9tKZeSh0e99KC5e3+qvKIAF37pCBJQDKhYqHCBJ+VSs48lunip4/Di+syHH6aBW9/QBTlQsIf8B0FAWAv2NC3WlBiU6vmhwwI2q0EDHBu3uZv11sJD5uQyxUxQQ3GxIZO9Cefy+XgLKlbB94FDyCR0kI1AABXjOATkZu6jUY9Ju2yoPNJY3hJQEXPk3YLxbCOirF3tQmVB4Sg==',
        SigningCertUrl:
          'https://sns.us-east-1.amazonaws.com/SimpleNotificationService-a86cb10b4e1f29c941702d737128f7b6.pem',
        UnsubscribeUrl:
          'https://sns.us-east-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:us-east-1:619887618095:gameattendanttasks-dev-send-notification-topic:8e975a3e-6553-448c-98ee-b5f4327eb280',
        MessageAttributes: {},
      },
    },
  ],
};

const expectedDeleteValidEvent = {
  Records: [
    {
      EventSource: 'aws:sns',
      EventVersion: '1.0',
      EventSubscriptionArn:
        'arn:aws:sns:us-east-1:619887618095:gameattendanttasks-dev-send-notification-topic:8e975a3e-6553-448c-98ee-b5f4327eb280',
      Sns: {
        Type: 'Notification',
        MessageId: '0ee0f049-65d7-5c39-b15c-a7d456a2dfc7',
        TopicArn: 'arn:aws:sns:us-east-1:619887618095:gameattendanttasks-dev-send-notification-topic',
        Subject: null,
        Message:
          '{"data": {"teamId":"VyXY1ikPw", "gameId":"gameId", "teamName":"testing2s","opponentName":"","dateTime":"7/30/2020, 3:44:31 PM","players":[{"firstName":"William","lastName":"VanDolah","sendEmail":false,"phoneNumber":"8179391234","id":"ZV0xu8M1p","type":null,"email":"success@simulator.amazonses.com","sendText":true}, {"firstName":"William","lastName":"VanDolah","sendEmail":false,"phoneNumber":"8179391234","id":"ZV0xu8M1p","type":null,"email":"success@simulator.amazonses.com","sendText":false}]},"statusType": 1}',
        Timestamp: '2020-07-30T20:44:37.943Z',
        SignatureVersion: '1',
        Signature:
          'DoSAni26GcqTiiiw1Gaw4GI5HPEqAmdwN9au08wVlm+YkAVQWhbXs7jGQPFBCky8B1qiwKSfE2VTgnFeQ8A/bPbkNKlIdUlk9JSafTB13epfe6LQtfjGP2Vjiln1vJjs9+B6LdcHy9tKZeSh0e99KC5e3+qvKIAF37pCBJQDKhYqHCBJ+VSs48lunip4/Di+syHH6aBW9/QBTlQsIf8B0FAWAv2NC3WlBiU6vmhwwI2q0EDHBu3uZv11sJD5uQyxUxQQ3GxIZO9Cefy+XgLKlbB94FDyCR0kI1AABXjOATkZu6jUY9Ju2yoPNJY3hJQEXPk3YLxbCOirF3tQmVB4Sg==',
        SigningCertUrl:
          'https://sns.us-east-1.amazonaws.com/SimpleNotificationService-a86cb10b4e1f29c941702d737128f7b6.pem',
        UnsubscribeUrl:
          'https://sns.us-east-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:us-east-1:619887618095:gameattendanttasks-dev-send-notification-topic:8e975a3e-6553-448c-98ee-b5f4327eb280',
        MessageAttributes: {},
      },
    },
  ],
};

const expectedEvent_invalidPlayerPhoneNumber = {
  Records: [
    {
      EventSource: 'aws:sns',
      EventVersion: '1.0',
      EventSubscriptionArn:
        'arn:aws:sns:us-east-1:619887618095:gameattendanttasks-dev-send-notification-topic:8e975a3e-6553-448c-98ee-b5f4327eb280',
      Sns: {
        Type: 'Notification',
        MessageId: '0ee0f049-65d7-5c39-b15c-a7d456a2dfc7',
        TopicArn: 'arn:aws:sns:us-east-1:619887618095:gameattendanttasks-dev-send-notification-topic',
        Subject: null,
        Message:
          '{"data": {"teamId":"VyXY1ikPw", "gameId":"gameId", "teamName":"testing2s","opponentName":"","dateTime":"7/30/2020, 3:44:31 PM","players":[{"firstName":"William","lastName":"VanDolah","sendEmail":false,"phoneNumber":"879391234","id":"ZV0xu8M1p","type":null,"email":"success@simulator.amazonses.com","sendText":true}, {"firstName":"William","lastName":"VanDolah","sendEmail":false,"phoneNumber":"817a391234","id":"ZV0xu8M1p","type":null,"email":"success@simulator.amazonses.com","sendText":true}]},"statusType": 0}',
        Timestamp: '2020-07-30T20:44:37.943Z',
        SignatureVersion: '1',
        Signature:
          'DoSAni26GcqTiiiw1Gaw4GI5HPEqAmdwN9au08wVlm+YkAVQWhbXs7jGQPFBCky8B1qiwKSfE2VTgnFeQ8A/bPbkNKlIdUlk9JSafTB13epfe6LQtfjGP2Vjiln1vJjs9+B6LdcHy9tKZeSh0e99KC5e3+qvKIAF37pCBJQDKhYqHCBJ+VSs48lunip4/Di+syHH6aBW9/QBTlQsIf8B0FAWAv2NC3WlBiU6vmhwwI2q0EDHBu3uZv11sJD5uQyxUxQQ3GxIZO9Cefy+XgLKlbB94FDyCR0kI1AABXjOATkZu6jUY9Ju2yoPNJY3hJQEXPk3YLxbCOirF3tQmVB4Sg==',
        SigningCertUrl:
          'https://sns.us-east-1.amazonaws.com/SimpleNotificationService-a86cb10b4e1f29c941702d737128f7b6.pem',
        UnsubscribeUrl:
          'https://sns.us-east-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:us-east-1:619887618095:gameattendanttasks-dev-send-notification-topic:8e975a3e-6553-448c-98ee-b5f4327eb280',
        MessageAttributes: {},
      },
    },
  ],
};

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
  const mockedSES = {
    sendBulkTemplatedEmail: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  };

  return {
    SNS: jest.fn(() => mockedSNS),
    SES: jest.fn(() => mockedSES),
  };
});

describe('sendNotification', () => {
  const sns = new SNS({ apiVersion: '2010-03-31', SMS: { smsType: 'Transactional' } });
  const messageInfo = JSON.parse(expectedValidEvent.Records[0].Sns.Message);
  const teamInfo = messageInfo.data;
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('when given event', () => {
    test('it returns success', async () => {
      const actual = await sendSms(expectedValidEvent);
      expect(actual).toBe('success');
    });

    test('it should send sms to each player with sentText flag', async () => {
      await sendSms(expectedValidEvent);
      const sendPlayers = teamInfo.players.reduce((sendTotal, player) => {
        return player.sendText ? sendTotal + 1 : sendTotal;
      }, 0);
      expect(sns.publish.mock.calls).toHaveLength(sendPlayers);
    });

    test('it should send sms to players phone number with correct message', async () => {
      await sendSms(expectedValidEvent);
      const baseUrl =
        process.env.env === 'prod'
          ? process.env.baseUrl.replace('<stage>', '')
          : process.env.baseUrl.replace('<stage>', `-${process.env.env}`);
      const sendPlayers = teamInfo.players
        .filter((player) => player.sendText)
        .map((player) => {
          const message = `Confirm your status for ${teamInfo.teamName} game at ${teamInfo.dateTime}: ${baseUrl}/statusUpdate?t=${teamInfo.teamId}&g=${teamInfo.gameId}&p=${player.id}`;
          return [{ Message: message, PhoneNumber: `+1${player.phoneNumber}` }];
        });
      expect(sns.publish.mock.calls).toEqual(sendPlayers);
    });

    test('it should not send to invalid numbers', async () => {
      JSON.parse(expectedEvent_invalidPlayerPhoneNumber.Records[0].Sns.Message);
      await sendSms(expectedEvent_invalidPlayerPhoneNumber);
      expect(sns.publish.mock.calls).toHaveLength(0);
    });
    test('it should send sms to players phone number with correct message when deleting', async () => {
      await sendSms(expectedDeleteValidEvent);
      const sendPlayers = teamInfo.players
        .filter((player) => player.sendText)
        .map((player) => {
          const message = `${teamInfo.teamName} game at ${teamInfo.dateTime} has been canceled or rescheduled.`;
          return [{ Message: message, PhoneNumber: `+1${player.phoneNumber}` }];
        });
      expect(sns.publish.mock.calls).toEqual(sendPlayers);
    });
    test('it should send sns, playerids, teamid, gameIds to be saved', async () => {
      await sendSms(expectedValidEvent);
      const { Items } = await snsEventQuery('da5a27f3-a831-5158-8594-70f62df89f77');
      const expected = {
        player: {
          phoneNumber: '8179391234',
          playerId: 'ZV0xu8M1p',
          snsMessageId: 'da5a27f3-a831-5158-8594-70f62df89f77',
        },
        retries: 0,
        snsMessageId: 'da5a27f3-a831-5158-8594-70f62df89f77',
        statusType: 0,
        teamInfo: { dateTime: '7/30/2020, 3:44:31 PM', gameId: 'gameId', teamId: 'VyXY1ikPw', teamName: 'testing2s' },
      };
      expect(Items[0]).toEqual(expected);
    });
  });
});
