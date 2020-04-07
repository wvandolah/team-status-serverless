'use strict';

const AWS = require('aws-sdk');
const SNS = new AWS.SNS({ apiVersion: '2010-03-31' });
module.exports.hello = async (event) => {
  const data = JSON.parse(event.body);
  const smsData = {
    Message: data.name,
    PhoneNumber: data.phone,
  };
  const response = await SNS.publish(smsData).promise();
  console.log(data);
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        input: data,
        message: response,
      },
      null,
      2,
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};
