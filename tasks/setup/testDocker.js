const childProcess = require('child_process');
const path = require('path');

module.exports = (dockerArgs) =>
  new Promise((resolve, reject) => {
    const paths = path.resolve(__dirname, '../');
    const childProc = childProcess.spawn('docker-compose', dockerArgs, { cwd: paths });
    childProc.on('error', (err) => {
      reject(err);
    });
    const result = {
      exitCode: null,
      err: '',
      out: '',
    };

    childProc.stdout.on('data', (chunk) => {
      result.out += chunk.toString();
    });

    childProc.stderr.on('data', (chunk) => {
      result.err += chunk.toString();
    });

    console.log(result);
    childProc.on('exit', (exitCode) => {
      result.exitCode = exitCode;
      if (exitCode === 0) {
        resolve(result);
      } else {
        reject(result);
      }
    });
  });
