# Endpoint Map (Core POS)

This maps the first Flutter modules to the production API endpoints.

## Auth
- POST `/auth/login`
- POST `/auth/loginUserAdminJwt`
- POST `/auth/logout`
- POST `/sendMail`

## Permissions
- GET `/mispermisos`

## POS (Retail)
- POST `/carritoVentas`
- GET `/carritoVentas`
- GET `/detalleCarritoVenta?carrito_venta={id}`
- DELETE `/carritoVentas/{id}`
- GET `/changeAlias/{id}?alias={alias}`
- GET `/saveNote/{id}?nota={nota}`
- POST `/venta-tienda/pagar`

## Cashbox
- POST `/cierreCaja`
- POST `/cerrarCaja`
- GET `/estadoCaja`
- GET `/cierreCaja`

## Inventory
- GET `/productos`
- POST `/productos`
- PUT `/productos/{id}`
- DELETE `/productos/{id}`
- GET `/busquedaPorNombreProductosActivas?search={search}`

## Customers
- GET `/clientes`
- POST `/clientes`
- PUT `/clientes/{id}`
- DELETE `/clientes/{id}`
- GET `/buscarCliente?search={search}`
- GET `/buscarClienteDocumento?search={search}`
