import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'oauth_clients' })
export class OAuthClient extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  clientId: string;

  @Column({ type: DataType.STRING, allowNull: false })
  clientSecret: string;

  @Column({ type: DataType.STRING, allowNull: false })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'http://localhost:3001/callback',
  })
  redirectUri: string;
}
