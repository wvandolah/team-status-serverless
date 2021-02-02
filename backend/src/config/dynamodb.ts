'use strict';

import { DocumentClient } from 'aws-sdk/clients/dynamodb';

let options: any = { convertEmptyValues: true };

// connect to local DB if running offline
if (process.env.IS_OFFLINE || process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  options = {
    ...options,
    region: 'localhost',
    endpoint: 'http://localhost:8000',
  };
}

export const dynamodb = new DocumentClient(options);
