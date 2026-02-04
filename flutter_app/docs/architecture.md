# Flutter Architecture Proposal

## Layers
```
Presentation (UI)
 └── Screens, Widgets, Navigation, Feature Routes
State Management
 └── Riverpod/Bloc (feature-scoped)
Domain
 └── Entities + UseCases
Data
 ├── Repositories (interfaces + impl)
 ├── Remote DataSources (API)
 └── Local DataSources (SQLite/Hive)
```

## Core Modules
- Auth & Session
- User Permissions (role-based access, menu gating)
- POS Sales (cart, payments, tickets)
- Inventory (products, categories, stock, transfers)
- Purchases (suppliers, credits, returns)
- Reports (sales, taxes, cashbox)
- Electronic documents (DIAN, RADIAN, payroll)

## Networking
- Base API: `https://conexion.puvesoft.co/api`
- Token header: `Authorization: Bearer <token>`
- Refresh/renew: handle 401/403 similar to Angular interceptor

## Offline-first
- Local DB: SQLite (transactions + indexes)
- Queue table for pending sync operations (sales, returns, cash movements)
- Sync service with:
  - connectivity watcher
  - exponential backoff
  - conflict policy (server authoritative + local reconciliation)

## Hardware Integrations
- Printers:
  - Android/iOS via vendor SDK or ESC/POS where allowed
  - Windows via native drivers (platform channel)
- Scanners:
  - USB HID / Bluetooth
  - Camera-based barcode/QR (Flutter camera + barcode plugin)

## Permissions
- Load permissions after login
- Route guard + widget-level gating
- Cache permissions locally for offline mode
