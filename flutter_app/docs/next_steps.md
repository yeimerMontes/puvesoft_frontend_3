# Immediate Next Steps

1. Scaffold Flutter project (`flutter create`) in this directory.
2. Wire `AppConfig.production()` as the default environment.
3. Implement HTTP client using Dio/Http + interceptors for auth.
4. Implement Auth flow:
   - POST /auth/login
   - POST /auth/loginUserAdminJwt
   - POST /auth/logout
5. Implement permissions fetch:
   - GET /mispermisos
6. Add POS core flows:
   - POST /carritoVentas
   - POST /venta-tienda/pagar
7. Add offline queue:
   - Persist cart + sales locally
   - Sync queue retries on reconnect
