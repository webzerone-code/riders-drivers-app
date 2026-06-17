import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

export type SocketMiddleware = (
  socket: Socket,
  next: (err?: Error) => void,
) => void;

export const WsAuthMiddleware = (jwtService: JwtService): SocketMiddleware => {
  return async (socket: Socket, next) => {
    try {
      //const token = socket.handshake.headers?.authorization;
      const token =
        socket.handshake.headers?.['authorization'] ||
        socket.handshake.auth?.token ||
        socket.handshake.query?.['token'];
      //socket.handshake.auth?.token || socket.handshake.headers?.authorization;
      if (!token) {
        return next(new Error('Unauthorized: No token provided'));
      }

      const payload = await jwtService.verifyAsync(token);
      socket.data.user = payload; //socket['user'] = payload; // Attach user before connection is "live"
      //console.log('User:', payload);
      next(); // Success! Proceed to handleConnection
    } catch (error) {
      next(new Error('Unauthorized: Invalid token')); // 🛑 Refuse connection
    }
  };
};
