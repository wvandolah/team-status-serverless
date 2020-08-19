const { join } = require('path');

module.exports = {
  testEnvironment: 'node',
  coverageReporters: ['lcov'],
  globalSetup: '<rootDir>/setup/setup.js',
  globalTeardown: '<rootDir>/setup/setupDown.js',
  testPathIgnorePatterns: ['/node_modules/', '/setup/', '/config/'],
  rootDir: './',
};
