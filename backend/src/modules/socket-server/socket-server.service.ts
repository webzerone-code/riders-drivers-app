import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RedisGeoService } from '../redis-geo/redis-geo.service';
import { SocketUser } from './types/socket-user.type';
import { UpdateLocationDto } from './dtos/update-location.dto';

@Injectable()
export class SocketServerService {
  constructor(
    private readonly userService: UserService,
    private readonly redisGeoService: RedisGeoService,
  ) {}

  async connectUser(userId: string, socketId: string): Promise<void> {
    await this.userService.updateUserStatus(userId, true);
    await this.userService.updateUserSocket(userId, socketId);
  }

  async updateUserLocation(
    user: SocketUser,
    data: UpdateLocationDto,
  ): Promise<void> {
    await this.redisGeoService.storeUserLocation(
      this.getKey(user.userType),
      user.id,
      data.longitude,
      data.latitude,
    );
  }

  async disconnectUser(user: SocketUser): Promise<void> {
    await this.redisGeoService.removeUserLocation(
      this.getKey(user.userType),
      user.id,
    );
    await this.userService.updateUserStatus(user.id, false);
    await this.userService.updateUserSocket(user.id, null);
  }

  private getKey(userType: string): string {
    return userType === 'rider' ? 'riders:locations' : 'drivers:locations';
  }
}
