import { Controller, Get, Header } from '@nestjs/common';

@Controller('auth')
export class AuthHtmlController {
  @Get('login-form')
  @Header('Content-Type', 'text/html')
  getLoginForm() {
    return `
      <!DOCTYPE html>
      <html>
      <head><title>Login</title></head>
      <body>
        <h2>Вход в систему</h2>
        <form method="POST" action="/auth/login">
          <div>
            <label>Email:</label>
            <input type="email" name="email" required />
          </div>
          <div>
            <label>Пароль:</label>
            <input type="password" name="password" required minlength="8" />
          </div>
          <button type="submit">Войти</button>
        </form>
        <p><a href="/auth/signup-form">Регистрация</a></p>
      </body>
      </html>
    `;
  }

  @Get('signup-form')
  @Header('Content-Type', 'text/html')
  getSignupForm() {
    return `
      <!DOCTYPE html>
      <html>
      <head><title>Регистрация</title></head>
      <body>
        <h2>Регистрация</h2>
        <form method="POST" action="/auth/signup">
          <div>
            <label>Email:</label>
            <input type="email" name="email" required />
          </div>
          <div>
            <label>Пароль (мин. 8 симв.):</label>
            <input type="password" name="password" required minlength="8" />
          </div>
          <div>
            <label>Телефон (опционально):</label>
            <input type="tel" name="phone" />
          </div>
          <button type="submit">Зарегистрироваться</button>
        </form>
        <p><a href="/auth/login-form">Уже есть аккаунт?</a></p>
      </body>
      </html>
    `;
  }
}
