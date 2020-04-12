'use strict';

const { searchStatusRecord, deleteStatusRecord } = require('../service/statusDB.service');
const { setResponse, parseEvent } = require('../helper');

module.exports.searchStatus = async (event) => {
  let { data, response, statusCode } = parseEvent(event);
  try {
    statusCode = 200;
    response = await searchStatusRecord(data);
  } catch (err) {
    console.error(err);
    statusCode = 500;
    response = {
      error: err.message,
    };
  }

  return setResponse(statusCode, response, data);
};

module.exports.deleteStatus = async (event) => {
  let { data, response, statusCode } = parseEvent(event);
  try {
    if ('team' in data && 'game' in data) {
      statusCode = 200;
      await deleteStatusRecord(data);
      response = 'success';
    } else {
      response = {
        error: 'Team and Game information not provided',
      };
      statusCode = 400;
    }
  } catch (err) {
    console.error(err);
    statusCode = 500;
    response = {
      error: err.message,
    };
  }
  return setResponse(statusCode, response, data);
};
