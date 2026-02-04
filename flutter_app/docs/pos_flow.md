# POS Flow (Retail)

## 1. Create cart items
- POST `/carritoVentas`

## 2. Review cart
- GET `/carritoVentas`
- GET `/detalleCarritoVenta?carrito_venta={id}`

## 3. Update cart metadata
- GET `/changeAlias/{id}?alias={alias}`
- GET `/saveNote/{id}?nota={nota}`

## 4. Checkout
- POST `/venta-tienda/pagar`

## 5. Cleanup
- DELETE `/carritoVentas/{id}`
