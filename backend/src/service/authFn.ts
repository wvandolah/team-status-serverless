import { APIGatewayAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import jwt from 'jsonwebtoken';
import jwks from 'jwks-rsa';
import util from 'util';

const keyClient = jwks({
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 5,
  jwksUri: process.env.jwksUri,
});

const verificationOptions: jwt.VerifyOptions = {
  audience: process.env.audience,
  algorithms: ['RS256'],
  issuer: process.env.issuer,
};
const extractTokenFromHeader = (e) => {
  if (e.authorizationToken && e.authorizationToken.split(' ')[0] === 'Bearer') {
    return e.authorizationToken.split(' ')[1];
  } else {
    return e.authorizationToken;
  }
};
export const authFn = async (event: APIGatewayAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  try {
    const token = extractTokenFromHeader(event);
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || typeof decoded === 'string' || !decoded.header || !decoded.header.kid) {
      throw new Error('Invalid token header');
    }

    const key = await util.promisify(keyClient.getSigningKey)(decoded.header.kid);

    const signingKey = key.getPublicKey();

    if (!signingKey) {
      throw new Error('could not get signing key');
    }

    const verifiedJWT: any = jwt.verify(token, signingKey, verificationOptions);

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
    console.warn(err);
    // Tells API Gateway to return a 401 Unauthorized response
    throw new Error('Unauthorized');
  }
};
