import {
  Table,
  Column,
  Model,
  DataType,
  BeforeCreate,
  BeforeUpdate,
} from 'sequelize-typescript';
import * as bcrypt from 'bcryptjs';

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model<User> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare phone: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare password: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare firstName: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare lastName: string | null;

  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(user: User) {
    if (user.changed('password')) {
      user.password = await bcrypt.hash(user.password, 10);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}
