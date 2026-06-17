import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import dbConfig from '../config/db.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SocketServerModule } from './socket-server/socket-server.module';
import JwtConfig from '../config/jwt.config';
import redisConfig from '../config/redis.config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ClientsModule } from '@nestjs/microservices';
import rabbitMQConfig from '../config/rabbitMQ.config';
import MongoDbConfig from '../config/mongo-db.config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [dbConfig, JwtConfig, redisConfig, rabbitMQConfig, MongoDbConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [dbConfig.KEY],
      useFactory: (db_config: ConfigType<typeof dbConfig>) => ({
        type: db_config.type as DataSourceOptions['type'],
        url: db_config.url,
        autoLoadEntities: db_config.autoLoadEntities,
        synchronize: db_config.synchronize,
        entities: db_config.entities,
      }),
    }),
    RedisModule.forRootAsync({
      inject: [redisConfig.KEY],
      useFactory: (redis_config: ConfigType<typeof redisConfig>) => ({
        type: 'single',
        url: redis_config.redisUrl,
      }),
    }),
    MongooseModule.forRootAsync({
      inject: [MongoDbConfig.KEY],
      useFactory: (
        mongoConfig: ConfigType<typeof MongoDbConfig>,
      ): { uri: string } => ({
        uri: mongoConfig.url,
      }),
    }),
    ClientsModule.registerAsync([
      {
        name: 'UserLocationHistoryService',
        inject: [rabbitMQConfig.KEY],
        useFactory: (rabbitmq_config: ConfigType<typeof rabbitMQConfig>) => ({
          transport: rabbitmq_config.transport,
          options: rabbitmq_config.options,
        }),
      },
    ]),
    AuthModule,
    UserModule,
    SocketServerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
