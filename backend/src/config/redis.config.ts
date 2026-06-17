import { registerAs } from '@nestjs/config';

export default registerAs('redisConfig', () => ({
  redisUrl: process.env.REDIS_URL,
}));
