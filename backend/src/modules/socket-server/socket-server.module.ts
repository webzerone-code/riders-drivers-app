import { Module } from '@nestjs/common';
import { SocketServerService } from './socket-server.service';
import { SocketServerGateway } from './socket-server.gateway';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { RedisGeoModule } from '../redis-geo/redis-geo.module';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [AuthModule, UserModule, RedisGeoModule, RabbitmqModule],
  providers: [SocketServerGateway, SocketServerService],
})
export class SocketServerModule {}
