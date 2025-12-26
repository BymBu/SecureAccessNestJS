import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '@models/user.model';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async createUser(email: string, password: string, phone?: string) {
    const existingUser = await this.userModel.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException(
        'Пользователь с таким адресом электронной почты уже существует',
      );
    }

    const userData: any = {
      email,
      password,
    };

    if (phone) {
      userData.phone = phone;
    }

    const user = await this.userModel.create(userData);

    return user.serialize();
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ where: { email } });
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }
}
