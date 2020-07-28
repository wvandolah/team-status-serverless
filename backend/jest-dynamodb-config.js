module.exports = async () => {
  const serverless = new (require('serverless'))();
  await serverless.init();
  const service = await serverless.variables.populateService();
  const resources = service.resources.Resources;
  const tables = Object.keys(resources)
    .map((name) => resources[name])
    .filter((r) => r.Type === 'AWS::DynamoDB::Table')
    .map((r) => r.Properties);
  const getEnv = {};
  Object.keys(service.functions)
    .map((funcName) => service.functions[funcName])
    .forEach((func) => {
      Object.keys(func.environment).forEach((funcEnv) => {
        if (funcEnv === 'jwksUri') {
          getEnv[funcEnv] = 'https://test/.well-known/jwks.json';
        } else {
          getEnv[funcEnv] = func.environment[funcEnv];
        }
      });
    });

  process.env = {
    ...process.env,
    ...getEnv,
  };
  return {
    tables,
    port: 8000,
  };
};
