'use strict';

const { DocumentClient } = require('aws-sdk/clients/dynamodb');

let options = { convertEmptyValues: true };

// connect to local DB if running offline
if (process.env.IS_OFFLINE || process.env.NODE_ENV) {
  console.log('**************** local *********************');
  options = {
    ...options,
    accessKeyId: 'aaa',
    secretAccessKey: 'bbb',
    region: 'localhost',
    endpoint: 'http://localhost:8000',
  };
}
const client = new DocumentClient(options);
module.exports = client;
