import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { OAuthClient } from '@models/OAuth-client.model';
import { OAuthToken } from '@models/OAuth-token.model';
import { User } from '@models/user.model';
import * as crypto from 'crypto';
import { TOKEN_EXPIRY } from '@config/constants';
import { UsersService } from '@users/users.service';

@Controller('oauth')
export class OAuthController {
  constructor(
    @InjectModel(OAuthClient)
    private clientModel: typeof OAuthClient,
    @InjectModel(OAuthToken)
    private tokenModel: typeof OAuthToken,
    @InjectModel(User)
    private userModel: typeof User,
    private usersService: UsersService,
  ) {}

  @Post('token')
  async getToken(
    @Body('grant_type') grantType: string,
    @Body('client_id') clientId: string,
    @Body('client_secret') clientSecret: string,
    @Body('username') username?: string,
    @Body('password') password?: string,
    @Body('refresh_token') refreshToken?: string,
  ) {
    const client = await this.clientModel.findOne({
      where: { clientId, clientSecret },
    });
    if (!client) {
      throw new UnauthorizedException('Неверные учетные данные клиента');
    }

    if (grantType === 'refresh_token') {
      if (!refreshToken) {
        throw new BadRequestException('требуется значение refresh_token');
      }

      const tokenRecord = await this.tokenModel.findOne({
        where: {
          refreshToken,
          clientId: client.id,
        },
      });

      if (!tokenRecord) {
        throw new UnauthorizedException('Недопустимый токен обновления');
      }

      if (tokenRecord.refreshExpiresAt < new Date()) {
        throw new UnauthorizedException(
          'Срок действия токена обновления истек',
        );
      }

      const newAccessToken = crypto
        .randomBytes(TOKEN_EXPIRY.RANDOMBYTES)
        .toString('hex');
      const newRefreshToken = crypto
        .randomBytes(TOKEN_EXPIRY.RANDOMBYTES)
        .toString('hex');

      await tokenRecord.update({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresAt: new Date(Date.now() + TOKEN_EXPIRY.ACCESS),
        refreshExpiresAt: new Date(Date.now() + TOKEN_EXPIRY.REFRESH),
      });

      return {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        token_type: 'Bearer',
        expires_in: TOKEN_EXPIRY.ACCESS / 1000, // в секунды
      };
    }

    if (grantType === 'password') {
      if (!username || !password) {
        throw new BadRequestException(
          'Для предоставления пароля требуются имя пользователя и пароль',
        );
      }

      const user = await this.userModel.findOne({ where: { email: username } });
      if (
        !user ||
        !(await this.usersService.validatePassword(user, password))
      ) {
        throw new UnauthorizedException('Неверные учетные данные');
      }

      const accessToken = crypto
        .randomBytes(TOKEN_EXPIRY.RANDOMBYTES)
        .toString('hex');
      const refreshToken = crypto
        .randomBytes(TOKEN_EXPIRY.RANDOMBYTES)
        .toString('hex');

      await this.tokenModel.create({
        accessToken,
        refreshToken,
        userId: user.id,
        clientId: client.id,
        expiresAt: new Date(Date.now() + TOKEN_EXPIRY.ACCESS),
        refreshExpiresAt: new Date(Date.now() + TOKEN_EXPIRY.REFRESH),
      });

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: 'Bearer',
        expires_in: TOKEN_EXPIRY.ACCESS / 1000, // в секунды
      };
    }

    throw new BadRequestException('Неподдерживаемый тип гранта');
  }
}
