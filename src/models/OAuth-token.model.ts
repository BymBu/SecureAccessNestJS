import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '@models/user.model';
import { OAuthClient } from '@models/OAuth-client.model';

@Table({ tableName: 'oauth_tokens' })
export class OAuthToken extends Model {
  @Column({ type: DataType.STRING })
  declare accessToken: string;

  @Column({ type: DataType.STRING })
  declare refreshToken: string;

  @Column({ type: DataType.DATE })
  declare refreshExpiresAt: Date;

  @Column({ type: DataType.STRING })
  declare authorizationCode: string;

  @Column({ type: DataType.DATE })
  declare expiresAt: Date;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  declare userId: number;

  @BelongsTo(() => User)
  declare user: User;

  @ForeignKey(() => OAuthClient)
  @Column({ type: DataType.INTEGER })
  declare clientId: number;
}
