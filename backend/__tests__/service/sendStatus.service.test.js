const { sendNotifications, sendStatusEmail, sendDeleteEmail } = require('../../src/service/sendStatus.service');
const { SNS } = require('aws-sdk');
const { SES } = require('aws-sdk');

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
    const sns = new SNS({ apiVersion: '2010-03-31', SMS: { smsType: 'Transactional' } });
    beforeEach(() => {
      process.env.IS_OFFLINE = '';
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
    test('it should publish received data to sns topic', async () => {
      await sendNotifications('game Data', 0);
      expect(sns.publish.mock.calls).toHaveLength(1);
    });
  });

  describe('when sending email', () => {
    const ses = new SES({ apiVersion: '2010-12-01' });
    test('new it should return sent emails and ses ids when successful', async () => {
      const players = [
        { sendEmail: true, email: 'test@test.com', firstNam: 'testName' },
        { sendEmail: true, email: 'test2@test.com', firstNam: 'test2Name' },
      ];
      ses.sendBulkTemplatedEmail().promise.mockResolvedValueOnce('mockResponse');
      const { sesReturn, sentEmails } = sendStatusEmail(players, {}, 'gameId');
      expect(sentEmails).toEqual(players);
      expect(await sesReturn).toBe('mockResponse');
    });
    test('new it should return empty list of sent emails and empty object when no emails', async () => {
      const players = [
        { sendEmail: false, email: 'test@test.com', firstNam: 'testName' },
        { sendEmail: false, email: 'test2@test.com', firstNam: 'test2Name' },
      ];
      ses.sendBulkTemplatedEmail().promise.mockResolvedValueOnce('mockResponse');
      const { sesReturn, sentEmails } = sendStatusEmail(players, {}, 'gameId');
      expect(sentEmails).toHaveLength(0);
      expect(sesReturn).toEqual({});
    });

    test('delete it ses ids when successful', async () => {
      const players = [
        { sendEmail: true, email: 'test@test.com', firstNam: 'testName' },
        { sendEmail: true, email: 'test2@test.com', firstNam: 'test2Name' },
      ];
      ses.sendBulkTemplatedEmail().promise.mockResolvedValueOnce('mockResponse');
      const actual = await sendDeleteEmail(players, {});

      expect(actual).toBe('mockResponse');
    });
    test('delete it should return empty list of sent emails and empty object when no emails', async () => {
      const players = [
        { sendEmail: false, email: 'test@test.com', firstNam: 'testName' },
        { sendEmail: false, email: 'test2@test.com', firstNam: 'test2Name' },
      ];
      ses.sendBulkTemplatedEmail().promise.mockResolvedValueOnce('mockResponse');
      const actual = await sendDeleteEmail(players, {});

      expect(actual).toEqual({});
    });
  });
});
