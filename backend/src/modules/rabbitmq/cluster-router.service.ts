import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { AmqpConnectionManager, ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';
import { Server } from 'socket.io';
import { INSTANCE_ID } from '../../config/server.instance';

@Injectable()
export class ClusterRouterService implements OnModuleInit {
  private routerChannel: ChannelWrapper;
  private ioServer: Server; // Reference to our local WebSocket server instance

  // The global core direct exchange name for our entire architecture cluster
  private readonly EXCHANGE_NAME = 'cluster_tracking_exchange';

  constructor(
    @Inject('CLUSTER_RABBITMQ_CONNECTION')
    private readonly connectionManager: AmqpConnectionManager,
  ) {}

  // Accept the active socket server reference from your Gateway later
  setIoServer(server: Server) {
    this.ioServer = server;
  }

  onModuleInit() {
    // ⚙️ Automatically triggers when NestJS finishes setting up modules
    this.routerChannel = this.connectionManager.createChannel({
      json: true, // Auto-converts objects to JSON strings
      setup: async (channel: ConfirmChannel) => {
        // 🌟 A. DECLARE THE GLOBAL EXCHANGE
        // 'direct' ensures strict one-to-one routing matching based on routing keys
        console.log(
          `🔨 [RabbitMQ Setup] Asserting Exchange: ${this.EXCHANGE_NAME}`,
        );
        await channel.assertExchange(this.EXCHANGE_NAME, 'direct', {
          durable: true,
        });

        // 🌟 B. DECLARE THIS INSTANCE'S DYNAMIC PRIVATE MAILBOX
        // durable: false and autoDelete: true ensures if this server crashes or scales down,
        // RabbitMQ instantly vaporizes this queue from memory to avoid leakage [^6].
        console.log(
          `🔨 [RabbitMQ Setup] Asserting Private Queue for: ${INSTANCE_ID}`,
        );
        await channel.assertQueue(INSTANCE_ID, {
          durable: false,
          autoDelete: true,
        });

        // 🌟 C. BIND THE QUEUE TO THE EXCHANGE (Create the routing address rule)
        // Parameters: (QueueName, ExchangeName, Binding/RoutingKey)
        console.log(
          `🔨 [RabbitMQ Setup] Binding Route: ${INSTANCE_ID} ➔ ${this.EXCHANGE_NAME}`,
        );
        await channel.bindQueue(INSTANCE_ID, this.EXCHANGE_NAME, INSTANCE_ID);

        // 🌟 D. OPEN MAILBOX FOR INTAKE: Listen to messages routed specifically to US
        await channel.consume(INSTANCE_ID, (msg) => {
          if (!msg) return;

          try {
            const payload = JSON.parse(msg.content.toString());
            console.log(
              `📥 [${INSTANCE_ID}] Received cross-instance package for socket: ${payload.targetSocketId}`,
            );
            console.log('payload:' + payload.eventName);
            if (this.ioServer) {
              // Extract the physical socket held in this machine's RAM
              const localSocket = this.ioServer.sockets.sockets.get(
                payload.targetSocketId,
              );
              if (localSocket) {
                // Blast the telemetry coordinates down the user's live physical wire!
                localSocket.emit(payload.eventName, payload.data);
              }
            } else {
              console.log('socket server not set');
            }
          } catch (err) {
            console.error(
              '❌ Failed to process incoming cluster message payload:',
              err.message,
            );
          }

          // Acknowledge the message was consumed safely from the server node
          channel.ack(msg);
        });

        console.log(
          `📡 [${INSTANCE_ID}] Success! Private routing mailbox is completely bound and live.`,
        );
      },
    });
  }

  // High-performance inter-server messaging helper
  async sendToInstance(
    targetInstanceId: string,
    packet: { targetSocketId: string; eventName: string; data: any },
  ) {
    try {
      // Send the packet over our code-created exchange using the destination server node ID as the routing key
      await this.routerChannel.publish(
        this.EXCHANGE_NAME,
        targetInstanceId,
        packet,
      );
    } catch (error) {
      console.error(
        `❌ Failed to deliver message to server node [${targetInstanceId}]:`,
        error.message,
      );
    }
  }
}
