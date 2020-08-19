const runDocker = require('./testDocker');
const seedData = require('./seedData');
const aws = require('aws-sdk');
const documentClient = require('../src/config/dynamodb');
aws.config.update({ accessKeyId: 'aaa', secretAccessKey: 'bbb', region: 'localhost' });
const options = { endpoint: new aws.Endpoint('http://localhost:8000') };
const dynamodb = new aws.DynamoDB(options);

module.exports = async () => {
  const dockerArgs = ['up', '-d'];
  const db = await runDocker(dockerArgs);
  console.log(db);
  const serverless = new (require('serverless'))();
  await serverless.init();
  const service = await serverless.variables.populateService();
  const resources = service.custom.tables;

  await Promise.all(
    Object.values(resources).map((configDb) => {
      const keySchema = configDb.range
        ? [
            {
              AttributeName: configDb.hash,
              KeyType: 'HASH',
            },
            {
              AttributeName: configDb.range,
              KeyType: 'RANGE',
            },
          ]
        : [
            {
              AttributeName: configDb.hash,
              KeyType: 'HASH',
            },
          ];
      const attributeDefinitions = configDb.range
        ? [
            {
              AttributeName: configDb.hash,
              AttributeType: 'S',
            },
            {
              AttributeName: configDb.range,
              AttributeType: 'S',
            },
          ]
        : [
            {
              AttributeName: configDb.hash,
              AttributeType: 'S',
            },
          ];

      const params = {
        TableName: configDb.name,
        KeySchema: keySchema,
        AttributeDefinitions: attributeDefinitions,
        ProvisionedThroughput: {
          // required provisioned throughput for the table
          ReadCapacityUnits: 1,
          WriteCapacityUnits: 1,
        },
      };

      return dynamodb.createTable(params).promise();
    }),
  );
  const getEnv = {};
  Object.keys(service.functions)
    .map((funcName) => service.functions[funcName])
    .forEach((func) => {
      if (func.environment) {
        Object.keys(func.environment).forEach((funcEnv) => {
          if (funcEnv === 'jwksUri') {
            getEnv[funcEnv] = 'https://test/.well-known/jwks.json';
          } else {
            getEnv[funcEnv] = func.environment[funcEnv];
          }
        });
      }
    });

  process.env = {
    ...process.env,
    ...getEnv,
  };
  let tableNames = [];
  dynamodb.listTables((err, data) => {
    tableNames = data.TableNames;
  });
  let seedPromises = [];

  Object.entries(seedData).forEach((seed) => {
    seedPromises = seed[1].map((seedEntry) => {
      const params = {
        TableName: seed[0],
        Item: seedEntry,
      };
      return documentClient.put(params).promise();
    });
  });
  await Promise.all(seedPromises);

  tableNames.forEach((table) => {
    const scanParams = {
      TableName: table,
    };
    documentClient.scan(scanParams, function (err, data) {
      if (err) console.log(err);
      else console.log('TableName ', table, ': ', data);
    });
  });
};
