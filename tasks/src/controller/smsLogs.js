'use strict';
// event will be a base64 zip file
// {
//   ('H4sIAAAAAAAAAGVTQW7bMBD8isFDLw0TkhIpyjfDToIAdRtEcoqiDgqKWttEJMoQaQdGkL93JSdoi97End2Z2SH1SloIwWyhPO2BTMliVs5+La+LYnZ7TS5I9+Khx7LiudaZ4prlEstNt73tu8MekeDD1SFQMCFSfvV339XC9WDj/aFqXNiV3f2u8/D10FbIOFIUsQfTIoeskyplUFPO65SmdpPSXHBBc5ZthNlkuRhVw6EKtnf76Dp/45oIfSDTn2RrWjAxgq+Nj9GE50BrONIb4xqoizZ86bah+G903nSH+ruJdoc4pz/SR33zmDG9SgV5Gu1dH8HHQeGVuBpdJlLxjLOEpbnQnOGOSsgsz9Ncca5UniipOddSZbkSCdZTLiVPFDqPDlOOpsXAuMwzLhRPMs2Ti4/0kf51TXwX3cZZM7hckylW3uG7Go9rwlKtwChBRSorKisrqE6FpVVtAZUzgX7W5GL9R28cE0wwyjSmO2FyKvVUistU6zV5w9YaGneE/nTW2w93NDd976AfZ2flp3Ky7CrXuHgauVtvEcHt8duPt/ltszzbvDd9DAM48obo/Mcqa/KZa57lSa5VJkeefe8s3PlVsUCcXTKmUonl0IbhKY4zZW98MHbgMM1Z3A7iCecjQXd0NfQPEPadD+eRdyeTnQmTCsBPjLWwj1BPqtNk3G7kqV+gaUpMaTn4FYz9W1v56JoFHNHhzD5jh2ICn/WQF8YaD2HUKlbzOf4pmCN5e3r7DRVosRpKAwAA');
// }
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

module.exports.failedSms = async (event) => {
  console.log(event);
};
