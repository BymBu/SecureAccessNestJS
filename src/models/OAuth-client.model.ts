import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'oauth_clients' })
export class OAuthClient extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  declare clientId: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare clientSecret: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'http://localhost:3001/callback',
  })
  declare redirectUri: string;
}
