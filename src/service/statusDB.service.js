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
  // this works to find a record by team and id in the dynamodb shell
  //   var params = {
  //     TableName: 'game-attendants',
  //     KeyConditionExpression: 'team = :teamVal and id = :id',

  //     ExpressionAttributeValues: { // a map of substitutions for all attribute values
  //       ':teamVal': 'someUUIDForTeams',
  //       ':id': '7e194a47-7709-4c1d-8a38-13d29003476d'
  //     },

  // };
  // docClient.query(params, function(err, data) {
  //     if (err) ppJson(err); // an error occurred
  //     else ppJson(data); // successful response
  // });
  searchStatusRecord: (searchParams) => {
    const { team, id } = searchParams;
    let keyString = '';
    let expressionAttObj = {};
    if (team && id) {
      keyString = `team = :team and id = :id`;
      expressionAttObj = {
        ':team': team,
        ':id': id,
      };
    } else if (team && !id) {
      keyString = 'team = :team';
      expressionAttObj = {
        ':team': team,
      };
    } else {
      throw new Error('Team information not provided');
    }
    const params = {
      TableName: process.env.tableGameAttendants,
      KeyConditionExpression: keyString,
      ExpressionAttributeValues: expressionAttObj,
    };
    console.log(params);
    var results = dynamodb.query(params).promise();
    results.then((e) => console.log(e));
  },
};
