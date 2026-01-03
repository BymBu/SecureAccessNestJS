import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { OAuthService } from './oauth.service';
import { OAuthGrantType } from './oauth.config';

@Controller('oauth')
export class OAuthController {
  constructor(private oauthService: OAuthService) {}

  @Post('token')
  async getToken(
    @Body('grant_type') grantType: string,
    @Body('client_id') clientId: string,
    @Body('client_secret') clientSecret: string,
    @Body('username') username?: string,
    @Body('password') password?: string,
    @Body('refresh_token') refreshToken?: string,
    @Body('scope') scope?: string,
    @Body('code') code?: string,
    @Body('redirect_uri') redirectUri?: string,
    @Body('code_verifier') codeVerifier?: string,
  ) {
    if (grantType === OAuthGrantType.PASSWORD) {
      if (!username || !password) {
        throw new BadRequestException('Требуется имя пользователя и пароль');
      }
      return await this.oauthService.handlePasswordGrant({
        username,
        password,
        clientId,
        clientSecret,
        scope,
      });
    }

    if (grantType === OAuthGrantType.REFRESH_TOKEN) {
      if (!refreshToken) {
        throw new BadRequestException('Требуется refresh token');
      }
      return await this.oauthService.handleRefreshToken({
        refreshToken,
        clientId,
        clientSecret,
      });
    }

    if (grantType === OAuthGrantType.AUTHORIZATION_CODE) {
      if (!code || !redirectUri) {
        throw new BadRequestException('требуется ввести код и redirect uri');
      }
      return await this.oauthService.handleAuthorizationCodeGrant({
        code,
        redirectUri,
        clientId,
        clientSecret,
        codeVerifier,
      });
    }

    throw new BadRequestException('Не поддерживаемый тип гранта');
  }
}
