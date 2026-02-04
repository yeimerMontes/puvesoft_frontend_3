class ApiEndpoints {
  static const String authLogin = '/auth/login';
  static const String authLoginAdmin = '/auth/loginUserAdminJwt';
  static const String authLogout = '/auth/logout';
  static const String sendMail = '/sendMail';

  static const String permissions = '/mispermisos';

  static const String cartSales = '/carritoVentas';
  static const String posPay = '/venta-tienda/pagar';
  static const String cartDetail = '/detalleCarritoVenta';
  static const String changeAlias = '/changeAlias';
  static const String saveNote = '/saveNote';

  static const String cashboxOpen = '/cierreCaja';
  static const String cashboxClose = '/cerrarCaja';
  static const String cashboxHistory = '/cierreCaja';
  static const String cashboxStatus = '/estadoCaja';
}
