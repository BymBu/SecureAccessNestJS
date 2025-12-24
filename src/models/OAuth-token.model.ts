import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from '../models/user.model';
import { OAuthClient } from './OAuth-client.model';

@Table({ tableName: 'oauth_tokens' })
export class OAuthToken extends Model {
  @Column({ type: DataType.STRING })
  accessToken: string;

  @Column({ type: DataType.STRING })
  authorizationCode: string;

  @Column({ type: DataType.DATE })
  expiresAt: Date;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  userId: number;

  @ForeignKey(() => OAuthClient)
  @Column({ type: DataType.INTEGER })
  clientId: number;
}
