import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import {
  CreateUserDto,
  LoginUserDto,
  TokenUserDto,
} from '../user/dtos/user.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto): Promise<User> {
    const checkEmail: User | null = await this.userService.getUserByEmail(
      dto.email,
    );
    if (checkEmail)
      throw new HttpException('Email already Exists', HttpStatus.CONFLICT);

    const checkPhone: User | null = await this.userService.getUserByPhone(
      dto.phone,
    );

    if (checkPhone)
      throw new HttpException('Phone already Exists', HttpStatus.CONFLICT);
    const hashedPassword: string = await bcrypt.hash(dto.password, 10);
    if (!hashedPassword)
      throw new HttpException(
        'Unable to hash password',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    return await this.userService.createUser({
      ...dto,
      password: hashedPassword,
    });
  }

  async loginUser(loginDto: LoginUserDto): Promise<TokenUserDto> {
    const user: User | null = await this.userService.getUserByEmail(
      loginDto.email,
    );
    if (!user) throw new UnauthorizedException('Error in validating user');

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Error in validating user');
    const token: string = await this.generateToken(user);
    if (!token) throw new UnauthorizedException('generate token error');
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      access_token: token,
    };
  }

  async generateToken(user: User): Promise<string> {
    const payload = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
    };
    return await this.jwtService.signAsync(payload);
  }

  async verifyToken(token: string): Promise<TokenUserDto> {
    try {
      return await this.jwtService.verifyAsync(token);
    } catch (error) {
      // You catch the 500 error and transform it into a clean, targeted 401 Unauthorized error
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
