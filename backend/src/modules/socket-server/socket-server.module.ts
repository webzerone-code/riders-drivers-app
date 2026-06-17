import { Module } from '@nestjs/common';
import { SocketServerService } from './socket-server.service';
import { SocketServerGateway } from './socket-server.gateway';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { RedisGeoModule } from '../redis-geo/redis-geo.module';

@Module({
  imports: [AuthModule, UserModule, RedisGeoModule],
  providers: [SocketServerGateway, SocketServerService],
})
export class SocketServerModule {}
