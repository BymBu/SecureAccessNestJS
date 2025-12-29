import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from '@models/user.model';
import { OAuthClient } from '@models/OAuth-client.model';

@Table({ tableName: 'oauth_auth_codes' })
export class OAuthAuthorizationCode extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  declare code: string;

  @Column({ type: DataType.STRING, allowNull: true })
  declare codeChallenge: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare codeChallengeMethod: string | null;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare userId: number;

  @ForeignKey(() => OAuthClient)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare clientId: number;

  @Column({ type: DataType.STRING, allowNull: true })
  declare redirectUri: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare scopes: string | null;

  @Column({ type: DataType.DATE, allowNull: false })
  declare expiresAt: Date;
}
