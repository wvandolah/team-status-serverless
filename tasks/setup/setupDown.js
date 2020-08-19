const runDocker = require('./testDocker');
module.exports = async () => {
  // afterAll(async () => {
  const dockerArgs = ['down', '-v'];
  const db = await runDocker(dockerArgs);
  console.log(db);
  console.log('teardown');
  // });
};
