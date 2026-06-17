import { Module } from '@nestjs/common';
import { RedisGeoService } from './redis-geo.service';

@Module({
  imports: [],
  controllers: [],
  providers: [RedisGeoService],
  exports: [RedisGeoService],
})
export class RedisGeoModule {}
