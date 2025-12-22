import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async createUser(email: string, password: string, phone?: string) {
    const existingUser = await this.userModel.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists'); // Исправь
    }
    const userData: any = {
      email,
      password,
    };

    if (phone !== undefined) {
      userData.phone = phone;
    }

    const user = await this.userModel.create(userData);

    const userJson = user.toJSON();
    const { password: _, ...result } = userJson;
    return result;
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ where: { email } });
  }
}
