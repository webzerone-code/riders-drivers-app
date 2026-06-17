import {
  Injectable,
  Inject,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel, ConsumeMessage } from 'amqplib';
//import { LocationHistoryService } from './location-history.service';

@Injectable()
export class LocationBatchConsumer implements OnModuleInit, OnModuleDestroy {
  private consumerChannel: ChannelWrapper;
  private messageBuffer: ConsumeMessage[] = [];

  private readonly QUEUE_NAME = 'user_location_history_queue';
  private readonly BATCH_SIZE = 500;
  private readonly FLUSH_TIMEOUT_MS = 2000; // Force flush every 2 seconds if under 500 items
  private flushTimer: any = null;

  constructor(
    // Inject the injection token representing your AmqpConnectionManager instance
    @Inject('LOCATION_SERVICE_QUEUE')
    private readonly connectionManager: AmqpConnectionManager,
    //private readonly historyService: LocationHistoryService,
  ) {}

  onModuleInit() {
    // 1. Initialize our dedicated dynamic channel wrapper
    this.consumerChannel = this.connectionManager.createChannel({
      setup: async (channel: ConfirmChannel) => {
        // Assert queue properties match your backend producer settings
        await channel.assertQueue(this.QUEUE_NAME, { durable: true });

        // 🛑 CRITICAL RATE LIMITER: Restrict message intake to exactly 500 items maximum
        await channel.prefetch(this.BATCH_SIZE);

        // 2. Start manual consumption listener
        await channel.consume(
          this.QUEUE_NAME,
          (msg) => this.handleMessage(msg, channel),
          {
            noAck: false, // Explicitly manual acknowledgements
          },
        );
      },
    });
  }

  private handleMessage(msg: ConsumeMessage | null, channel: ConfirmChannel) {
    if (!msg) return;

    this.messageBuffer.push(msg);

    // If this is the first item landing in an empty buffer pool, start the backup clock
    if (this.messageBuffer.length === 1) {
      this.startFlushTimer(channel);
    }

    // Peak Performance Target: If we hit 500 items, clear them immediately
    if (this.messageBuffer.length >= this.BATCH_SIZE) {
      this.flushBatch(channel);
    }
  }

  private flushBatch(channel: ConfirmChannel) {
    if (this.messageBuffer.length === 0) return;

    // Wipe out active background backup timers
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    // Pull an instant atomic copy of the buffer array and wipe out the main holder
    const batchToProcess = [...this.messageBuffer];
    this.messageBuffer = [];

    try {
      // Direct raw JSON conversion — no framework wrapper stripping necessary!
      const parsedRecords = batchToProcess.map((msg) => {
        const payload = JSON.parse(msg.content.toString());
        return {
          userId: payload.userId,
          userType: payload.userType,
          location: {
            type: 'Point',
            coordinates: [payload.longitude, payload.latitude], // [Lng, Lat]
          },
        };
      });

      // 3. Execute ONE network write operation to drop all 500 items into MongoDB
      //await this.historyService.bulkInsertHistoryPoints(parsedRecords);
      console.log(
        `📦 MQ Worker: Successfully batch-inserted ${parsedRecords.length} items to MongoDB.`,
      );

      // 4. BULK ACKNOWLEDGEMENT: Tell RabbitMQ all 500 records are safely saved on disk
      const lastMessage = batchToProcess[batchToProcess.length - 1];
      channel.ack(lastMessage, true); // 'true' runs a cumulative confirmation up to this index point
    } catch (error) {
      console.error(
        '❌ MongoDB Bulk insert crashed. Returning records to RabbitMQ server:',
        error.message,
      );

      // If MongoDB goes down, release the messages back to RabbitMQ so no data is dropped
      for (const msg of batchToProcess) {
        channel.nack(msg, false, true); // nack each individual item back to the broker
      }
    }
  }

  private startFlushTimer(channel: ConfirmChannel) {
    this.flushTimer = setTimeout(() => {
      this.flushBatch(channel);
    }, this.FLUSH_TIMEOUT_MS);
  }

  onModuleDestroy() {
    if (this.flushTimer) clearTimeout(this.flushTimer);
  }
}
