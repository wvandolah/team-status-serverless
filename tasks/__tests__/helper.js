const dynamodb = require('../src/config/dynamodb');
module.exports = {
  searchStatusRecord: (teamId, gameId) => {
    const keyString = `teamId = :teamId and gameId = :gameId`;
    const expressionAttObj = {
      ':teamId': teamId,
      ':gameId': gameId,
    };

    const params = {
      TableName: process.env.tableGameAttendants,
      KeyConditionExpression: keyString,
      ExpressionAttributeValues: expressionAttObj,
    };
    return dynamodb.query(params).promise();
  },
};
