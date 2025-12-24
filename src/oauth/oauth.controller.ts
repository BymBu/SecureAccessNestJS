import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { OAuthClient } from '../models/OAuth-client.model';
import { OAuthToken } from '../models/OAuth-token.model';
import { User } from '../models/user.model';
import * as crypto from 'crypto';
import { TOKEN_EXPIRY } from 'src/config/constants';

@Controller('oauth')
export class OAuthController {
  constructor(
    @InjectModel(OAuthClient)
    private clientModel: typeof OAuthClient,
    @InjectModel(OAuthToken)
    private tokenModel: typeof OAuthToken,
    @InjectModel(User)
    private userModel: typeof User,
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
      throw new UnauthorizedException('Invalid client credentials');
    }

    let userId: number;
    if (username && password) {
      const user = await this.userModel.findOne({ where: { email: username } });
      if (!user || !(await user.validatePassword(password))) {
        throw new UnauthorizedException('Invalid credentials');
      }
      userId = user.id;
    } else {
      const firstUser = await this.userModel.findOne();
      if (!firstUser) {
        throw new UnauthorizedException('No users found in database');
      }
      userId = firstUser.id;
    }

    const accessToken = crypto.randomBytes(32).toString('hex');

    await this.tokenModel.create({
      accessToken,
      userId,
      clientId: client.id,
      expiresAt: new Date(Date.now() + TOKEN_EXPIRY.ACCESS),
    });

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
    };
  }
}
