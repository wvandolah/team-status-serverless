const {
  sendStatusSMS,
  sendDeleteSMS,
  sendStatusEmail,
  sendDeleteEmail,
} = require('../../src/service/sendStatus.service');
const { SNS } = require('aws-sdk');
const { SES } = require('aws-sdk');

jest.mock('aws-sdk', () => {
  const mockedSNS = {
    publish: jest.fn().mockReturnThis(),
    promise: jest.fn(),
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
    const mockPlayer = { id: 'playerId', phoneNumber: '8178178171' };
    const mockTeamGame = { teamName: 'dudeBros', dateTime: 'today', teamId: 'teamId' };
    const mockGameId = 'gameId';
    const message = `Confirm your status for ${mockTeamGame.teamName} game at ${mockTeamGame.dateTime}: https://teamstatus.wvandolah.com/statusUpdate?t=${mockTeamGame.teamId}&g=${mockGameId}&p=${mockPlayer.id}`;
    const mockResponse = {
      ResponseMetadata: {
        RequestId: message,
      },
      MessageId: 'da5a27f3-a831-5158-8594-70f62df89f77',
    };
    beforeEach(() => {
      process.env.IS_OFFLINE = '';
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
    test('it should return list of sns request id when sending new game status', async () => {
      sns.publish().promise.mockResolvedValueOnce(mockResponse);
      const actual = await sendStatusSMS('string', '8179398675');
      expect(actual).toEqual(mockResponse);
    });
    test('it should mock when offline and return actual msg when sending new game status', async () => {
      process.env.IS_OFFLINE = true;
      const actual = await sendStatusSMS(mockPlayer, mockTeamGame, mockGameId);
      expect(actual).toEqual(mockResponse);
    });
    test('it should return list of sns request id when sending delete game status', async () => {
      sns.publish().promise.mockResolvedValueOnce(mockResponse);
      const actual = await sendDeleteSMS('string', '8179398675');
      expect(actual).toEqual(mockResponse);
    });
    test('it should mock when offline and return actual msg when delete new game status', async () => {
      process.env.IS_OFFLINE = true;
      const deleteMessage = `${mockTeamGame.teamName} game at ${mockTeamGame.dateTime} has been canceled or rescheduled.`;
      const actual = await sendDeleteSMS(mockPlayer, mockTeamGame, mockGameId);

      expect(actual).toEqual({ ...mockResponse, ResponseMetadata: { RequestId: deleteMessage } });
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
