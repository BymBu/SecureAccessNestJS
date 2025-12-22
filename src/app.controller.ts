import { Controller, Get, Post, Body } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getStatus() {
    return {
      status: 'OAuth Server is running',
      db: 'PostgreSQL + Sequelize',
      next: 'Implement /auth/signup and /oauth/* endpoints',
    };
  }
}
