import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as crypto from 'crypto';
import { TOKEN_EXPIRY } from '@config/constants';
import { OAuthClient } from '@models/OAuth-client.model';
import { OAuthToken } from '@models/OAuth-token.model';
import { User } from '@models/user.model';
import { UsersService } from '@users/users.service';
import { OAuthCodeChallengeMethod, OAuthScope } from './oauth.config';
import { OAuthAuthorizationCode } from '@models/OAuth-auth-code.model';
import { base64UrlEncode } from 'src/utils';

@Injectable()
export class OAuthService {
  constructor(
    @InjectModel(OAuthClient)
    private clientModel: typeof OAuthClient,
    @InjectModel(OAuthToken)
    private tokenModel: typeof OAuthToken,
    @InjectModel(User)
    private userModel: typeof User,
    private usersService: UsersService,
  ) {}

  generateAccessToken(): string {
    return crypto.randomBytes(TOKEN_EXPIRY.RANDOMBYTES).toString('hex');
  }

  generateRefreshToken(): string {
    return crypto.randomBytes(TOKEN_EXPIRY.RANDOMBYTES + 4).toString('hex');
  }

  async createToken({
    userId,
    clientId,
    scopes,
  }: {
    userId: number;
    clientId: number;
    scopes: string;
  }) {
    return this.tokenModel.create({
      accessToken: this.generateAccessToken(),
      refreshToken: this.generateRefreshToken(),
      userId,
      clientId,
      scopes,
      expiresAt: new Date(Date.now() + TOKEN_EXPIRY.ACCESS),
      refreshExpiresAt: new Date(Date.now() + TOKEN_EXPIRY.REFRESH),
    });
  }

  async handlePasswordGrant({
    username,
    password,
    clientId,
    clientSecret,
    scope,
  }: {
    username: string;
    password: string;
    clientId: string;
    clientSecret: string;
    scope?: string;
  }) {
    const client = await this.clientModel.findOne({
      where: { clientId, clientSecret },
    });
    if (!client) {
      throw new UnauthorizedException('Неверные учетные данные клиента');
    }

    const user = await this.userModel.findOne({ where: { email: username } });
    if (!user || !(await this.usersService.validatePassword(user, password))) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    const token = await this.createToken({
      userId: user.id,
      clientId: client.id,
      scopes: scope || OAuthScope.OPENID,
    });

    return {
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
      token_type: 'Bearer',
      expires_in: TOKEN_EXPIRY.ACCESS / 1000, // в секунды
    };
  }

  async handleRefreshToken({
    refreshToken,
    clientId,
    clientSecret,
  }: {
    refreshToken: string;
    clientId: string;
    clientSecret: string;
  }) {
    const client = await this.clientModel.findOne({
      where: { clientId, clientSecret },
    });
    if (!client) {
      throw new UnauthorizedException('Неверные учетные данные клиента');
    }

    const tokenRecord = await this.tokenModel.findOne({
      where: { refreshToken, clientId: client.id },
    });

    if (!tokenRecord || tokenRecord.refreshExpiresAt.getTime() < Date.now()) {
      throw new BadRequestException(
        'Недействительный или просроченный токен обновления',
      );
    }

    const newAccessToken = this.generateAccessToken();
    const newRefreshToken = this.generateRefreshToken();

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
      expires_in: TOKEN_EXPIRY.ACCESS / 1000,
    };
  }

  async handleAuthorizationCodeGrant({
    code,
    redirectUri,
    clientId,
    clientSecret,
    codeVerifier,
  }: {
    code: string;
    redirectUri: string;
    clientId: string;
    clientSecret: string;
    codeVerifier?: string;
  }) {
    const client = await this.clientModel.findOne({
      where: { clientId, clientSecret },
    });
    if (!client) {
      throw new UnauthorizedException('Неверные учетные данные клиента');
    }

    const authCode = await OAuthAuthorizationCode.findOne({ where: { code } });
    if (!authCode || authCode.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Недействительный или просроченный код');
    }

    if (redirectUri !== authCode.redirectUri) {
      throw new UnauthorizedException('Неверное перенаправление uri');
    }

    if (authCode.codeChallenge) {
      if (!codeVerifier) {
        throw new BadRequestException('требуется code verifier');
      }

      let challenge: string;
      if (authCode.codeChallengeMethod === OAuthCodeChallengeMethod.S256) {
        const hash = crypto.createHash('sha256').update(codeVerifier).digest();
        challenge = base64UrlEncode(hash);
      } else {
        challenge = codeVerifier; // plain
      }

      if (challenge !== authCode.codeChallenge) {
        throw new UnauthorizedException('Неверный код подтверждения');
      }
    }

    const token = await this.createToken({
      userId: authCode.userId,
      clientId: authCode.clientId,
      scopes: authCode.scopes || OAuthScope.OPENID,
    });

    await authCode.destroy();

    return {
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
      token_type: 'Bearer',
      expires_in: TOKEN_EXPIRY.ACCESS / 1000,
    };
  }
}
