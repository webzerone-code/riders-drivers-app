import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketServerService } from './socket-server.service';
import { JwtService } from '@nestjs/jwt';
import { WsAuthMiddleware } from '../../middleware/ws.middleware';
import { UpdateLocationDto } from './dtos/update-location.dto';
// import Redis from 'ioredis';
// import { InjectRedis } from '@nestjs-modules/ioredis';

@WebSocketGateway({
  //path: '/socket-server',
  cors: { origin: '*', credentials: true },
  //namespace: 'socket-server',
})
export class SocketServerGateway implements OnGatewayConnection {
  constructor(
    private readonly socketServerService: SocketServerService,
    private jwtService: JwtService,
  ) {}
  @WebSocketServer() server: Server;
  //afterInit(client: Socket) {
  afterInit() {
    this.server.use(WsAuthMiddleware(this.jwtService));
  }

  async handleConnection(client: Socket) {
    //console.log(`New client joined: ${client.id}`);

    // You can attach custom data to the client object safely
    //client['user']['sockerId'] = client.id;
    client.data.user.socketId = client.id;
    await this.socketServerService.connectUser(client.data.user.id, client.id);
    console.log(client.data);
  }

  @SubscribeMessage('update_location')
  async updateLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: UpdateLocationDto,
  ): Promise<void> {
    await this.socketServerService.updateUserLocation(client.data.user, data);
    console.log(data);
  }

  // @SubscribeMessage('send_message')
  // handleMessage(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() data: { text: string },
  // ): void {
  //   // 🟢 This sends to EVERYONE in that room (including the sender)
  //   this.server.emit('receive_message', {
  //     id: crypto.randomUUID(), // Creates a completely unique string ID
  //     text: data.text, // The clean text sent from React
  //     timestamp: new Date().toISOString(),
  //   });
  // }

  async handleDisconnect(client: Socket): Promise<void> {
    // TODO need check if the user has no trips before removing it
    await this.socketServerService.disconnectUser(client.data.user);
    console.log(`Client disconnected: ${client.data.user.id}`);
  }
}

//1,000 Connections: The Operating System Limit (Unoptimized)Your server will crash or reject new users right around 1,000 connections if you leave your production server completely unconfigured.This is not NestJS's fault. This happens because Linux and macOS default to a strict safety limit of 1,024 open network handles per application process. The moment connection number 1,025 tries to dial in, the operating system kernel instantly shuts down the application with a Too many open files error.10,000 Connections: The Node.js Hardware Limit (Optimized Monolith)Your server can scale up to 10,000 concurrent connections on a single Node.js background thread only after you remove that operating system limit (using the ulimit -n 65000 command we discussed).Once the operating system lets the traffic through, your next boundary is hardware. At around 10,000 connected clients, the raw RAM required to store your customized client.data.user tracking payloads will fill up Node's default memory allocation space (around 1.4 GB), causing a system crash.
