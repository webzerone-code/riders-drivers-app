import { registerAs } from '@nestjs/config';

export default registerAs('mongoDB', () => ({
  url:
    process.env.MONGO_URI ??
    (() => {
      throw new Error('MONGO_URI missing');
    })(),
}));
