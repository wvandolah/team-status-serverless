'use strict';

const dynamodb = require('../config/dynamodb');

module.exports = {
  createStatusRecord: (record) => {
    const params = {
      TableName: process.env.tableGameAttendants,
      Item: {
        ...record,
        status: null,
      },
    };
    return dynamodb.put(params).promise();
  },
};
