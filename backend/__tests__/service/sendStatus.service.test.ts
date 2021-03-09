import { sendNotifications, sendStatusEmail, sendDeleteEmail } from '../../src/service/sendStatus.service';
import { SNS, SES, Request, AWSError } from 'aws-sdk';
import { SendBulkTemplatedEmailResponse } from 'aws-sdk/clients/ses';
import { PromiseResult } from 'aws-sdk/lib/request';
import { Player, PlayerStatus, PlayerTypes, Status, StatusUpdateBody } from '../../../common/models';

jest.mock('aws-sdk', () => {
  const mockedSNS = {
    publish: jest.fn().mockReturnThis(),
    promise: jest.fn().mockReturnThis(),
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

describe('sendStatus.service', () => {
  describe('when sending sms', () => {
    const sns: SNS = new SNS({ apiVersion: '2010-03-31' });
    const mockPublish = sns.publish as jest.Mock<Request<SNS.PublishResponse, AWSError>>;

    beforeEach(() => {
      process.env.IS_OFFLINE = '';
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
    test('it should publish received data to sns topic', async () => {
      const sending: Status = {
        gameId: '1',
      };
      await sendNotifications(sending, 0);
      expect(mockPublish.mock.calls).toHaveLength(1);
    });
  });

  describe('when sending email', () => {
    const ses = new SES({ apiVersion: '2010-12-01' });
    const mockPromise = ses.sendBulkTemplatedEmail().promise as jest.Mock<any>;
    const body: StatusUpdateBody = {
      players: [
        {
          sendEmail: true,
          email: 'test@test.com',
          firstName: 'testName',
          id: 'test-id',
          lastName: 'test-lastName',
          phoneNumber: 'test-phoneNumber',
          sendText: true,
          status: PlayerStatus.IN,
          smsDelivered: false,
          type: PlayerTypes.FULL,
        },
      ],
      teamId: 'teamId-test',
      gameId: 'gameId-test',
      historic: 'historic-test',
    };
    test('new it should return sent emails and ses ids when successful', async () => {
      const players: Player[] = [
        {
          sendEmail: true,
          email: 'test@test.com',
          firstName: 'testName',
          id: 'test-id',
          lastName: 'test-lastName',
          phoneNumber: 'test-phoneNumber',
          sendText: true,
          status: PlayerStatus.IN,
          smsDelivered: false,
          type: PlayerTypes.FULL,
        },
        {
          sendEmail: true,
          email: 'test2@test.com',
          firstName: 'test2Name',
          id: 'test-id',
          lastName: 'test-lastName',
          phoneNumber: 'test-phoneNumber',
          sendText: true,
          status: PlayerStatus.IN,
          smsDelivered: false,
          type: PlayerTypes.FULL,
        },
      ];

      mockPromise.mockResolvedValueOnce('mockResponse');
      const { sesReturn, sentEmails } = sendStatusEmail(players, body);
      expect(sentEmails).toEqual(players);
      expect(await sesReturn).toBe('mockResponse');
    });
    test('new it should return empty list of sent emails and empty object when no emails', async () => {
      const players: Player[] = [
        {
          sendEmail: false,
          email: 'test@test.com',
          firstName: 'testName',
          id: 'test-id',
          lastName: 'test-lastName',
          phoneNumber: 'test-phoneNumber',
          sendText: true,
          status: PlayerStatus.IN,
          smsDelivered: false,
          type: PlayerTypes.FULL,
        },
        {
          sendEmail: false,
          email: 'test2@test.com',
          firstName: 'test2Name',
          id: 'test-id',
          lastName: 'test-lastName',
          phoneNumber: 'test-phoneNumber',
          sendText: true,
          status: PlayerStatus.IN,
          smsDelivered: false,
          type: PlayerTypes.FULL,
        },
      ];
      mockPromise.mockResolvedValueOnce('mockResponse');
      const { sesReturn, sentEmails } = sendStatusEmail(players, body);
      expect(sentEmails).toHaveLength(0);
      expect(sesReturn).toEqual({});
    });

    test('delete it ses ids when successful', async () => {
      const players = [
        {
          sendEmail: true,
          email: 'test@test.com',
          firstName: 'testName',
          id: 'test-id',
          lastName: 'test-lastName',
          phoneNumber: 'test-phoneNumber',
          sendText: true,
          status: PlayerStatus.IN,
          smsDelivered: false,
          type: PlayerTypes.FULL,
        },
        {
          sendEmail: true,
          email: 'test2@test.com',
          firstName: 'test2Name',
          id: 'test-id',
          lastName: 'test-lastName',
          phoneNumber: 'test-phoneNumber',
          sendText: true,
          status: PlayerStatus.IN,
          smsDelivered: false,
          type: PlayerTypes.FULL,
        },
      ];
      mockPromise.mockResolvedValueOnce('mockResponse');
      const actual = await sendDeleteEmail(players, {});

      expect(actual).toBe('mockResponse');
    });
    test('delete it should return empty list of sent emails and empty object when no emails', async () => {
      const players = [
        {
          sendEmail: false,
          email: 'test@test.com',
          firstName: 'testName',
          id: 'test-id',
          lastName: 'test-lastName',
          phoneNumber: 'test-phoneNumber',
          sendText: true,
          status: PlayerStatus.IN,
          smsDelivered: false,
          type: PlayerTypes.FULL,
        },
        {
          sendEmail: false,
          email: 'test2@test.com',
          firstName: 'test2Name',
          id: 'test-id',
          lastName: 'test-lastName',
          phoneNumber: 'test-phoneNumber',
          sendText: true,
          status: PlayerStatus.IN,
          smsDelivered: false,
          type: PlayerTypes.FULL,
        },
      ];
      mockPromise.mockResolvedValueOnce('mockResponse');
      const actual = await sendDeleteEmail(players, {});

      expect(actual).toEqual({});
    });
  });
});
