import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class RedisGeoService {
  constructor(@InjectRedis() private readonly redisClient: Redis) {}

  async storeUserLocation(
    storeKey: string,
    userId: string,
    longitude: string,
    latitude: string,
  ): Promise<void> {
    await this.redisClient.geoadd(storeKey, longitude, latitude, userId);
  }
  async removeUserLocation(storeKey: string, userId: string): Promise<void> {
    await this.redisClient.zrem(storeKey, userId);
  }
}
