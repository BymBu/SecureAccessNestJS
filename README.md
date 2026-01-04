# 🛡️ SecureAccess — OAuth 2.0 + PKCE Server

Минималистичный, безопасный OAuth-сервер на NestJS с поддержкой PKCE.

## ✅ Функциональность

- ✅ Password grant
- ✅ Refresh_token  
- ✅ Authorization_code + PKCE
- ✅ Scope (profile, email, phone)
- ✅ Защита от подбора учетных данных
- ✅ Token rotation

## 🚀 Быстрый старт

```bash
npm install
npm run start:dev
```
Сервер запустится на http://localhost:3000.

## 🔑 Поддерживаемые гранты
1. Password Grant
```
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=password
&client_id=test_client
&client_secret=test_secret_for_development_only
&username=user@example.com
&password=12345678
&scope=profile email
```
2. Refresh Token
```
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token
&client_id=test_client
&client_secret=test_secret_for_development_only
&refresh_token=...
```
3. Authorization Code + PKCE
Создайте code вручную в БД (oauth_auth_codes)

Обменяйте на токены:

```
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&client_id=test_client
&client_secret=test_secret_for_development_only
&code=...
&redirect_uri=http://localhost:3001/callback
&code_verifier=...
```
## 🗃️ Модели БД
- users — пользователи
- oauth_clients — доверенные клиенты
- oauth_tokens — токены доступа и обновления
- oauth_auth_codes — временные коды авторизации (PKCE)

## 🛠️ Требования
- Node.js ≥ 18
- PostgreSQL
- npm

## 💡 Для разработки
Используйте Postman для тестирования эндпоинтов.

Важно: Все токены хранятся в БД, пароли хешируются через bcrypt.