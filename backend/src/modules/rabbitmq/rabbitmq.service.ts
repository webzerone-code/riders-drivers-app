import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager';

@Injectable()
export class RabbitmqService implements OnModuleInit {
  private channelWrapper: ChannelWrapper;
  private readonly QUEUE_NAME = 'user_location_history_queue';
  constructor(
    @Inject('LOCATION_SERVICE_QUEUE')
    private readonly rabbitmqClient: AmqpConnectionManager,
  ) {}

  onModuleInit() {
    // 1. Create a lightweight virtual channel inside your single TCP pipe
    this.channelWrapper = this.rabbitmqClient.createChannel({
      json: true, // Tells the client to automatically stringify objects to JSON
      setup: async (channel) => {
        // 2. Ensure the queue exists on the RabbitMQ broker
        return await channel.assertQueue(this.QUEUE_NAME, { durable: true });
      },
    });
  }

  // 3. High-performance, fire-and-forget raw data streamer
  async sendLocation(payload: {
    userId: string;
    socketId: string;
    userType: string;
    longitude: string;
    latitude: string;
  }): Promise<void> {
    try {
      await this.channelWrapper.sendToQueue(this.QUEUE_NAME, payload);
    } catch (error) {
      console.error(
        '❌ RabbitMQ channel failed to queue location packet:',
        error.message,
      );
    }
  }
}
