# Auth & Permissions Flow

## Login
1. POST `/auth/login`
2. Store token
3. GET `/mispermisos`
4. Cache permissions

## Admin Login
1. POST `/auth/loginUserAdminJwt`
2. Store token
3. GET `/mispermisos`

## Logout
- POST `/auth/logout`
- Clear token + permissions cache
