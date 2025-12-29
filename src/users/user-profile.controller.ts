import {
  Controller,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '@models/user.model';
import { OAuthToken } from '@models/OAuth-token.model';
import { UsersService } from './users.service';

@Controller('api/user')
export class UserProfileController {
  constructor(
    @InjectModel(OAuthToken)
    private tokenModel: typeof OAuthToken,
    private usersService: UsersService,
  ) {}

  @Get('me')
  async getProfile(@Headers('authorization') auth: string) {
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('Не найден или не правильный токен');
    }

    const accessToken = auth.split(' ')[1];

    const tokenRecord = await this.tokenModel.findOne({
      where: { accessToken },
      include: [{ model: User, as: 'user' }],
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Истекший токен');
    }

    if (!tokenRecord.user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    const requestedScopes = tokenRecord.scopes?.split(' ') || ['openid'];
    return this.usersService.filterUserByScopes(
      tokenRecord.user,
      requestedScopes,
    );
  }
}
