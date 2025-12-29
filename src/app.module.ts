import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule } from '@nestjs/config';
import { User } from '@models/user.model';
import { OAuthClient } from '@models/OAuth-client.model';
import { OAuthToken } from '@models/OAuth-token.model';
import { AppController } from './app.controller';
import { UsersController } from '@users/users.controller';
import { UsersService } from '@users/users.service';
import { OAuthController } from '@oauth/oauth.controller';
import { UserProfileController } from '@users/user-profile.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'oauth_db',
      models: [User, OAuthClient, OAuthToken],
      autoLoadModels: true,
      synchronize: process.env.NODE_ENV !== 'production',
      logging: false,
    }),
    SequelizeModule.forFeature([User, OAuthClient, OAuthToken]),
  ],
  controllers: [
    AppController,
    UsersController,
    OAuthController,
    UserProfileController,
  ],
  providers: [UsersService],
})
export class AppModule {}
