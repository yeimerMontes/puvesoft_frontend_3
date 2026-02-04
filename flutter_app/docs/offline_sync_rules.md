# Offline Sync Rules (POS)

## Goals
- Allow full POS sales while offline.
- Sync in order when connectivity returns.
- Prevent duplicate invoice emission.

## Queue Types
- `sale:create` (venta completa)
- `cart:update`
- `cashbox:open`
- `cashbox:close`

## Conflict Policy
- Server is source of truth.
- If server rejects a sale, mark item as failed and surface to operator.
- Allow manual retry after conflict resolution.

## Sync Order
1. cashbox open
2. cart updates
3. sales
4. cashbox close

## Recommended Metadata
- local_id (uuid)
- server_id (nullable)
- created_at
- retries
