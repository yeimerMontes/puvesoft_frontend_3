class PosRepository {
  Future<void> createSale(Map<String, dynamic> payload) async {
    // TODO: POST /venta-tienda/pagar or /ventaRestaurante
  }

  Future<void> createCartItem(Map<String, dynamic> payload) async {
    // TODO: POST /carritoVentas
  }

  Future<void> deleteCartItem(String cartId) async {
    // TODO: DELETE /carritoVentas/{id}
  }
}
