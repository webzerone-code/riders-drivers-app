import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CreateUserDto,
  LoginUserDto,
  TokenUserDto,
  UserResponseDto,
} from '../user/dtos/user.dto';
import { User } from '../user/entities/user.entity';
import { plainToInstance } from 'class-transformer';
import { GetUser } from '../../decorators/get-user.decorator';
import { AuthGuard } from '../../guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const user: User = await this.authService.register(registerDto);
      return plainToInstance(UserResponseDto, user, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginUserDto): Promise<TokenUserDto> {
    try {
      return await this.authService.loginUser(loginDto);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(AuthGuard)
  @Get('me')
  me(@GetUser() user: { id: string; email: string; phone: string }): {
    id: string;
    email: string;
    phone: string;
  } {
    return user;
  }
}
