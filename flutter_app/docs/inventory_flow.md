# Inventory Flow (Products)

## List products
- GET `/productos?page={page}&search={search}&size={size}&paginate={paginate}&typeProduct={typeProduct}&bodega={bodega}`

## Create product
- POST `/productos`

## Update product
- PUT `/productos/{id}` (backend uses PUT)

## Delete product
- DELETE `/productos/{id}`

## Search active products
- GET `/busquedaPorNombreProductosActivas?search={search}`
