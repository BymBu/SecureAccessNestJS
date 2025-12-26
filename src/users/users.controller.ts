import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from '@users/users.service';
import { UnauthorizedException } from '@nestjs/common';

@Controller('auth')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('phone') phone?: string,
  ) {
    const user = await this.usersService.createUser(email, password, phone);
    return {
      message: 'Пользователь успешно зарегистрирован!',
      user,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    if (!(await this.usersService.validatePassword(user, password))) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    return {
      message: 'Вход в систему прошел успешно',
      userId: user.id,
      nextStep: 'Используйте поток OAuth для получения токена доступа',
    };
  }
}
