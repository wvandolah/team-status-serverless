const { authFn } = require('../../src/service/authFn');
const createJWKSMock = require('mock-jwks').default;

describe('authFn.service', () => {
  describe('when accessing protected route', () => {
    const jwks = createJWKSMock('https://test');
    const successfulReturn = {
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

    beforeEach(() => {
      jwks.start();
    });

    afterEach(() => {
      jwks.stop();
    });

    test('it should allow if token', async () => {
      const token = jwks.token({
        aud: process.env.audience,
        iss: process.env.issuer,
      });

      const actual = await authFn({ authorizationToken: token });

      expect(actual).toEqual(successfulReturn);
    });

    test('it should fail if incorrect audience', async () => {
      const token = jwks.token({});
      try {
        await authFn({ authorizationToken: token });
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toEqual(new Error('Unauthorized'));
      }
    });
    test('it should fail if expired token', async () => {
      const token = jwks.token({
        aud: process.env.audience,
        iss: process.env.issuer,
        exp: 0,
      });
      try {
        await authFn({ authorizationToken: token });
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toEqual(new Error('Unauthorized'));
      }
    });
  });
});
