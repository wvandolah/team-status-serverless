// eslint-disable-next-line @typescript-eslint/no-var-requires
const { defaults: tsjPreset } = require('ts-jest/presets');

module.exports = {
  preset: '@shelf/jest-dynamodb',
  testEnvironment: 'node',
  coverageReporters: ['lcov'],
  transform: tsjPreset.transform,
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
};
