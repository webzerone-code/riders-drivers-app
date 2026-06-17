import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dtos/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email: email },
    });
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { phone: phone },
    });
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      password: dto.password,
      userType: dto.userType ? dto.userType : 'rider',
      status: true,
      verified: true,
      verificationCode: '123456',
    });
    return await this.userRepository.save(user);
  }

  async updateUserSocket(
    userId: string,
    socketId: string | null,
  ): Promise<void> {
    try {
      await this.userRepository.update(userId, { socketId });
    } catch (error) {
      throw new HttpException(
        `Error updating user socket ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUserStatus(userId: string, status: boolean): Promise<void> {
    try {
      await this.userRepository.update(userId, { status: status });
    } catch (error) {
      throw new HttpException(
        `Error updating user socket ${error}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
