'use strict';
const jwt = require('jsonwebtoken');
const jwks = require('jwks-rsa');
const util = require('util');

const keyClient = jwks({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
  jwksUri: process.env.jwksUri,
});

const verificationOptions = {
  audience: process.env.audience,
  algorithms: 'RS256',
  issuer: process.env.issuer,
};
const extractTokenFromHeader = (e) => {
  if (e.authorizationToken && e.authorizationToken.split(' ')[0] === 'Bearer') {
    return e.authorizationToken.split(' ')[1];
  } else {
    return e.authorizationToken;
  }
};
module.exports = {
  authFn: async (event) => {
    try {
      const token = extractTokenFromHeader(event);
      const decoded = jwt.decode(token, { complete: true });
      if (!decoded || typeof decoded === 'string' || !decoded.header || !decoded.header.kid) {
        throw new Error('Invalid token header');
      }
      const key = await util.promisify(keyClient.getSigningKey)(decoded.header.kid);
      const signingKey = key.publicKey || key.rsaPublicKey;
      if (!signingKey) {
        throw new Error('could not get signing key');
      }
      const verifiedJWT = jwt.verify(token, signingKey, verificationOptions);
      return {
        principalId: verifiedJWT.sub,
        policyDocument: {
          Version: '2012-10-17',
          Statement: [
            {
              Action: 'execute-api:Invoke',
              Effect: 'Allow',
              Resource: '*',
            },
          ],
        },
      };
    } catch (err) {
      console.warn(JSON.stringify(err));
      // Tells API Gateway to return a 401 Unauthorized response
      throw new Error('Unauthorized');
    }
  },
};
