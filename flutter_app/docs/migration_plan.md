# Migration Plan (Module-Based)

## Phase 0: Discovery & Mapping
- Inventory current Angular modules, services, endpoints
- Map permissions and role-based UI
- Define offline scope and conflict rules

## Phase 1: Foundation
- Flutter project setup
- Auth + token handling + permission bootstrap
- Navigation + feature routing
- Shared UI components (buttons, tables, forms)

## Phase 2: Core POS
- Products catalog
- Cart and checkout
- Payment flows
- Ticket generation + printing
- Cashbox open/close

## Phase 3: Inventory
- Product CRUD + categories
- Stock adjustments
- Transfers (warehouse/sucursal)
- Insumos + production

## Phase 4: Purchases
- Supplier management
- Purchase flow
- Returns
- Credit purchases

## Phase 5: Reports
- Sales reports
- Taxes and utilities
- Cashbox history
- Exports (PDF/Excel)

## Phase 6: Electronic Documents
- DIAN integration
- RADIAN events
- Electronic payroll
- Notes & re-sends

## Phase 7: Offline + Sync Hardening
- Offline sales validation
- Sync queue processing
- Background retries
- Conflict resolution

## Phase 8: QA + Rollout
- Hardware regression
- Multi-platform packaging
- Pilot store rollout
