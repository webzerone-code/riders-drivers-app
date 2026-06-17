import { registerAs } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';

export default registerAs('rabbitmqHistory', () => ({
  transport: Transport.RMQ as const,
  options: {
    urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
    queue: process.env.RABBITMQ_QUEUE || 'user_location_history_queue',
    queueOptions: {
      durable: true,
    },
  },
}));
