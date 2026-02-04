# Endpoint Map (Core POS)

This maps the first Flutter modules to the production API endpoints. It mirrors the Angular POS service surface so we can track parity during migration.

**Base URL:** `https://conexion.puvesoft.co/api` (production, same as Angular `environment.prod.ts`)

## Auth
**Service:** `AuthRepository`

| Repository method | Endpoint | Purpose |
| --- | --- | --- |
| `login` | POST `/auth/login` | Login with user credentials. |
| `loginAdmin` | POST `/auth/loginUserAdminJwt` | Admin login for user creation/override flows. |
| `logout` | POST `/auth/logout` | Logout and invalidate session. |
| `sendPasswordRecovery` | POST `/sendMail` | Trigger password recovery email. |

## Permissions
**Service:** `PermissionsRepository`

| Repository method | Endpoint | Purpose |
| --- | --- | --- |
| `fetchPermissions` | GET `/mispermisos` | Load role-based permissions for UI gating. |

## POS (Retail)
**Service:** `PosRepository`

| Repository method | Endpoint | Purpose |
| --- | --- | --- |
| `createCartItem` | POST `/carritoVentas` | Add item to cart. |
| `fetchCartItems` | GET `/carritoVentas` | Fetch cart items. |
| `fetchCartDetail` | GET `/detalleCarritoVenta?carrito_venta={id}` | Fetch cart detail. |
| `updateCartAlias` | GET `/changeAlias/{id}?alias={alias}` | Update customer alias. |
| `saveCartNote` | GET `/saveNote/{id}?nota={nota}` | Save cart note. |
| `deleteCartItem` | DELETE `/carritoVentas/{id}` | Remove cart item. |
| `createSale` | POST `/venta-tienda/pagar` | Pay and create sale. |

## Source references
- `flutter_app/lib/core/network/api_endpoints.dart` (canonical endpoint constants)
- `flutter_app/lib/features/auth/data/auth_repository.dart`
- `flutter_app/lib/features/permissions/data/permissions_repository.dart`
- `flutter_app/lib/features/pos/data/pos_repository.dart`
