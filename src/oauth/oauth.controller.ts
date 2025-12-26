import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
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
  ) {
    const client = await this.clientModel.findOne({
      where: { clientId, clientSecret },
    });
    if (!client) {
      throw new UnauthorizedException('Неверные учетные данные клиента');
    }

    if (grantType !== 'password') {
      throw new UnauthorizedException('Неподдерживаемый тип гранта');
    }

    if (!username || !password) {
      throw new UnauthorizedException(
        'Для предоставления доступа требуются имя пользователя и пароль',
      );
    }

    const user = await this.userModel.findOne({ where: { email: username } });
    if (!user || !(await this.usersService.validatePassword(user, password))) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    const accessToken = crypto.randomBytes(32).toString('hex');
    await this.tokenModel.create({
      accessToken,
      userId: user.id,
      clientId: client.id,
      expiresAt: new Date(Date.now() + TOKEN_EXPIRY.ACCESS),
    });

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: TOKEN_EXPIRY.ACCESS / 1000,
    };
  }
}
