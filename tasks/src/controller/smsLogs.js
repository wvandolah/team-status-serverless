'use strict';
const zlib = require('zlib');
const { snsEventQuery, snsEventSave } = require('../service/notificationEventsDb');
const { updateSmsDeliveryStatus } = require('../service/statusDB');
const { sendMsg } = require('../service/sendNotification');
const { smsDeliveryTypes } = require('../helper');
module.exports.failedSms = async (event) => {
  const { data } = event.awslogs;
  try {
    console.log('[smsLogs]: received event: ', event);
    const buff = new Buffer.from(data, 'base64');
    const logEvents = JSON.parse(zlib.unzipSync(buff).toString()).logEvents.map((singleEvent) =>
      JSON.parse(singleEvent.message),
    );
    console.log('[smsLogs]: received event unzipped: ', logEvents);

    const { Items } = await snsEventQuery(logEvents[0].notification.messageId);
    console.log('[smsLogs]: retrieved saved sns event Items: ', Items);
    if (Items.length === 0) {
      console.log('[smsLogs]: snsId not found: ', logEvents[0].notification.messageId, 'logEvent: ', logEvents);
      return 'snsId not found';
    }
    if (logEvents[0].status === 'SUCCESS') {
      console.log('[smsLogs]: successful: ', logEvents[0].notification.messageId);
      const { teamId, gameId } = Items[0].teamInfo;
      const { playerId } = Items[0].player;
      await updateSmsDeliveryStatus(teamId, gameId, playerId, smsDeliveryTypes.SUCCESS);
      return logEvents;
    }

    if (Items[0].retries >= 3) {
      console.log('[smsLogs]: max retries reach: ', logEvents[0].notification.messageId, Items[0]);
      return 'max retries reach';
    }

    const newSnsId = await sendMsg(Items[0].statusType, Items[0].teamInfo, Items[0].player);
    const result = {
      ...Items[0],
      players: [{ ...Items[0].player, snsMessageId: newSnsId.MessageId }],
      retries: Items[0].retries + 1,
    };
    console.log('[smsLogs]: saving:', result);
    await snsEventSave(result);

    return logEvents;
  } catch (e) {
    console.error('failedSms error: ', e, e.message);
    return 'error';
  }
};
