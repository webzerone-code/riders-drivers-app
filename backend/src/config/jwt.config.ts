import { registerAs } from '@nestjs/config';

export default registerAs('jwtConfig', () => ({
  jwtSecret:
    (process.env.JWT_SECRET as string) ??
    (() => {
      throw new Error('JWTSECRET missing');
    })(),
  jwtExpiresIn:
    (process.env.JWT_EXPIRATION as any) ??
    (() => {
      throw new Error('JWTEXPIRESIN missing');
    })(),
}));
