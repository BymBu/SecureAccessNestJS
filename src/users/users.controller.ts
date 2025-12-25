import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from '@users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import { SignupDto } from '@dto/signup.dto';
import { LoginDto } from '@dto/login.dto';

@Controller('auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async signup(@Body() dto: SignupDto) {
    const user = await this.usersService.createUser(
      dto.email,
      dto.password,
      dto.phone,
    );
    return {
      message: 'Пользователь успешно зарегистрирован!',
      user,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async login(@Body() dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || !(await user.validatePassword(dto.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      message: 'Login successful',
      userId: user.id,
      nextStep: 'Use OAuth flow to get access token',
    };
  }
}
