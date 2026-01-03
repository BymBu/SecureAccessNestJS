import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from '@models/user.model';
import { OAuthClient } from '@models/OAuth-client.model';

@Table({ tableName: 'oauth_auth_codes', timestamps: true })
export class OAuthAuthorizationCode extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  declare code: string;

  @Column({ type: DataType.STRING, allowNull: true, field: 'code_challenge' })
  declare codeChallenge: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    field: 'code_challenge_method',
  })
  declare codeChallengeMethod: string | null;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'user_id',
  })
  declare userId: number;

  @ForeignKey(() => OAuthClient)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'client_id',
  })
  declare clientId: number;

  @Column({ type: DataType.STRING, allowNull: true, field: 'redirect_uri' })
  declare redirectUri: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare scopes: string | null;

  @Column({ type: DataType.DATE, allowNull: false, field: 'expires_at' })
  declare expiresAt: Date;
}
