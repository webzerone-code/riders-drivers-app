import { Module } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';
import { ClientsModule } from '@nestjs/microservices';
import rabbitMQConfig from '../../config/rabbitMQ.config';
import { ConfigType } from '@nestjs/config';
import amqp from 'amqp-connection-manager';
import { LocationBatchConsumer } from './location-batch.consumer';
import { INSTANCE_ID } from '../../config/server.instance';
import { ClusterRouterService } from './cluster-router.service';

@Module({
  imports: [
    // ClientsModule.registerAsync([
    //   {
    //     name: 'LOCATION_SERVICE_QUEUE',
    //     inject: [rabbitMQConfig.KEY],
    //     useFactory: (rabbitmq_config: ConfigType<typeof rabbitMQConfig>) => ({
    //       transport: rabbitmq_config.transport,
    //       options: rabbitmq_config.options,
    //     }),
    //   },
    // ]),
  ],
  providers: [
    {
      provide: 'LOCATION_SERVICE_QUEUE',
      useFactory: () => {
        const rabbitUrl =
          process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672';
        console.log(
          `⚙️ Factory initializing connection to: ${rabbitUrl} with instance ID: ${INSTANCE_ID}`,
        );

        const connection = amqp.connect([rabbitUrl]); // Pass as an array for reliability

        // connection.on('connectFailed', (error) => {
        //   console.error(
        //     '❌ RabbitMQ Initial Connection Failed:',
        //     error.err.message,
        //   );
        // });
        // connection.on('connect', () =>
        //   console.log('🚀 Connected to RabbitMQ!'),
        // );
        // connection.on('disconnect', (err) =>
        //   console.error('❌ Disconnected', err),
        // );

        return connection;
      },
    },
    {
      provide: 'CLUSTER_RABBITMQ_CONNECTION',
      useFactory: () => {
        const rabbitUrl =
          process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672';
        console.log(
          `⚙️ Factory initializing connection to: ${rabbitUrl} with instance ID: ${INSTANCE_ID}`,
        );

        const connection = amqp.connect([rabbitUrl]);
        return connection;
      },
    },
    RabbitmqService,
    LocationBatchConsumer,
    ClusterRouterService,
  ],
  exports: [RabbitmqService, ClusterRouterService],
})
export class RabbitmqModule {}
