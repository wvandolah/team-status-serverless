'use strict';

const { searchStatusRecord } = require('../service/statusDB.service');
const { setResponse } = require('../helper');

module.exports.searchStatus = async (event) => {
  const data = JSON.parse(event.body);
  let response = {};
  let statusCode = '';
  try {
    searchStatusRecord(data);
  } catch (err) {
    console.error('hello', err);
    statusCode = 500;
    response = {
      error: err.message,
    };
  }

  return setResponse(statusCode, response, data);
};
