'use strict';

const { searchStatusRecord } = require('../service/statusDB.service');
const { setResponse } = require('../helper');

module.exports.searchStatus = async (event) => {
  const data = JSON.parse(event.body);
  searchStatusRecord();
  return setResponse(200, data, data);
};
