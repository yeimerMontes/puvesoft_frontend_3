export const selectsPagination: number[] = [2, 10, 50, 100, 1000];

export const metodoPagos = [
  { id: 1, nombre: 'EFECTIVO' },
  { id: 2, nombre: 'CRÉDITO' },
  { id: 3, nombre: 'TRANSFERENCIA BANCARIA' },
  { id: 4, nombre: 'BANCOLOMBIA' },
  { id: 5, nombre: 'BANCOLOMBIA A LA MANO' },
  { id: 6, nombre: 'DAVIVIENDA' },
  { id: 7, nombre: 'DAVIPLATA' },
  { id: 8, nombre: 'NEQUI' },
  { id: 9, nombre: 'TARJETA DE CRÉDITO DATÁFONO' },
  { id: 11, nombre: 'TARJETA DE DÉBITO DATÁFONO' },
  { id: 10, nombre: 'COMBINADO' },
  { id: 12, nombre: 'OTROS' },
];

export const estadosCreditos = [
  { id: 1, nombre: 'Pagado' },
  { id: 2, nombre: 'Proceso' }, //add
  { id: 3, nombre: 'Anulado' },
  { id: 4, nombre: 'Crédito' },
  { id: 5, nombre: 'Cortesía' }, //add
  { id: 6, nombre: 'Plan Separe' }, //add
];

export const tipoAtencion = [
  { id: 1, nombre: 'Cajero' },
  { id: 2, nombre: 'Mesero' },
];

export const estadosCreditosCompras = [
  { id: 1, nombre: 'Pagado' },
  { id: 3, nombre: 'Anulado' },
  { id: 4, nombre: 'Crédito' },
];

export const tiposUtilidades = [
  { id: 3, nombre: 'Utilidades pagadas' },
  { id: 2, nombre: 'Utilidades con crédito' },
  { id: 6, nombre: 'Utilidades con plan separe' },
  { id: 4, nombre: 'Cortesia' },
];

export const tiposDetalleVenta = [
  { id: 3, nombre: 'Facturas pagadas' },
  { id: 2, nombre: 'Facturas con crédito' },
  { id: 6, nombre: 'Facturas con plan separe' },
];

export const tiposVentas = [
  { id: 1, nombre: 'En sitio' },
  { id: 2, nombre: 'Domicilio' },
];

export const tiposFacturas = [
  { id: 1, nombre: 'Con propina' },
  { id: 2, nombre: 'Sin propina' },
];

export const tiposFacturasVentas = [
  { id: 1, nombre: 'Recibos' },
  { id: 2, nombre: 'POS electrónico' },
  { id: 3, nombre: 'Facturas electrónicas' },
  { id: 4, nombre: 'POS electrónico y facturas electrónicas' },
];

export const tipoSeguimiento = [
  { id: 1, nombre: 'Compras' },
  { id: 2, nombre: 'Ventas' }, //add
  { id: 3, nombre: 'Devoluciones' },
  { id: 4, nombre: 'Ajustes de inventario' },
  { id: 4, nombre: 'Todas' },
];

export const tipoFactura = [
  { id: 1, nombre: 'RECIBO' },
  { id: 2, nombre: 'POS ELECTRÓNICO' },
  { id: 3, nombre: 'FACTURA ELECTRÓNICA' },
];

export const tipoFacturaCompra = [
  { id: 1, nombre: 'FACTURA COMPRA' },
  { id: 4, nombre: 'DOCUMENTO SOPORTE ELECTRÓNICO' },
];

export const tipoNotaCreditoFacturaElectronica = [
  {
    id: 1,
    nombre:
      'DEVOLUCIÓN PARCIAL DE LOS BIENES Y/O NO ACEPTACIÓN PARCIAL DE SERVICIO',
  },
  { id: 2, nombre: 'ANULACIÓN DE FACTURA' },
  { id: 3, nombre: 'REBAJA O DESCUENTO PARCIAL O TOTAL' },
  { id: 4, nombre: 'AJUSTE DE PRECIO' },
];

export const tipoNotaDebitoFacturaElectronica = [
  { id: 1, nombre: 'INTERESES' },
  { id: 2, nombre: 'GASTOS POR COBRAR' },
  { id: 3, nombre: 'CAMBIO DEL VALOR' },
  { id: 4, nombre: 'OTROS' },
];
/* 1- registrar compra, 
         2- anular compra, 
         3- nueva venta, 
         4- anular venta, 
         5- devolucion, 
         6- incremento por ajuste de inventario 
         7- disminucion por ajuste de inventario 
         */
export const frecuenciaPago = [
  { id: 1, nombre: 'Semanal' },
  { id: 2, nombre: 'Decenal' },
  { id: 3, nombre: 'Catorcenal' },
  { id: 4, nombre: 'Quincenal' },
  { id: 5, nombre: 'Mensual' },
];

export const tipoCuenta = [
  { id: 1, nombre: 'Ahorros' },
  { id: 2, nombre: 'Corriente' },
];


export const paisesMonedas = [
  { pais: 'Afganistán', codigo: 'AFN', simbolo: '؋' },
  { pais: 'Albania', codigo: 'ALL', simbolo: 'L' },
  { pais: 'Alemania', codigo: 'EUR', simbolo: '€' },
  { pais: 'Andorra', codigo: 'EUR', simbolo: '€' },
  { pais: 'Angola', codigo: 'AOA', simbolo: 'Kz' },
  { pais: 'Arabia Saudita', codigo: 'SAR', simbolo: '﷼' },
  { pais: 'Argelia', codigo: 'DZD', simbolo: 'د.ج' },
  { pais: 'Argentina', codigo: 'ARS', simbolo: '$' },
  { pais: 'Australia', codigo: 'AUD', simbolo: '$' },
  { pais: 'Austria', codigo: 'EUR', simbolo: '€' },
  { pais: 'Bahamas', codigo: 'BSD', simbolo: '$' },
  { pais: 'Bangladesh', codigo: 'BDT', simbolo: '৳' },
  { pais: 'Bélgica', codigo: 'EUR', simbolo: '€' },
  { pais: 'Bolivia', codigo: 'BOB', simbolo: 'Bs.' },
  { pais: 'Brasil', codigo: 'BRL', simbolo: 'R$' },
  { pais: 'Bulgaria', codigo: 'BGN', simbolo: 'лв' },
  { pais: 'Canadá', codigo: 'CAD', simbolo: '$' },
  { pais: 'Chile', codigo: 'CLP', simbolo: '$' },
  { pais: 'China', codigo: 'CNY', simbolo: '¥' },
  { pais: 'Colombia', codigo: 'COP', simbolo: '$' },
  { pais: 'Corea del Sur', codigo: 'KRW', simbolo: '₩' },
  { pais: 'Costa Rica', codigo: 'CRC', simbolo: '₡' },
  { pais: 'Cuba', codigo: 'CUP', simbolo: '$' },
  { pais: 'Dinamarca', codigo: 'DKK', simbolo: 'kr' },
  { pais: 'Ecuador', codigo: 'USD', simbolo: '$' },
  { pais: 'Egipto', codigo: 'EGP', simbolo: '£' },
  { pais: 'El Salvador', codigo: 'USD', simbolo: '$' },
  { pais: 'Emiratos Árabes Unidos', codigo: 'AED', simbolo: 'د.إ' },
  { pais: 'España', codigo: 'EUR', simbolo: '€' },
  { pais: 'Estados Unidos', codigo: 'USD', simbolo: '$' },
  { pais: 'Filipinas', codigo: 'PHP', simbolo: '₱' },
  { pais: 'Francia', codigo: 'EUR', simbolo: '€' },
  { pais: 'Guatemala', codigo: 'GTQ', simbolo: 'Q' },
  { pais: 'Honduras', codigo: 'HNL', simbolo: 'L' },
  { pais: 'India', codigo: 'INR', simbolo: '₹' },
  { pais: 'Indonesia', codigo: 'IDR', simbolo: 'Rp' },
  { pais: 'Israel', codigo: 'ILS', simbolo: '₪' },
  { pais: 'Italia', codigo: 'EUR', simbolo: '€' },
  { pais: 'Japón', codigo: 'JPY', simbolo: '¥' },
  { pais: 'México', codigo: 'MXN', simbolo: '$' },
  { pais: 'Nicaragua', codigo: 'NIO', simbolo: 'C$' },
  { pais: 'Nigeria', codigo: 'NGN', simbolo: '₦' },
  { pais: 'Noruega', codigo: 'NOK', simbolo: 'kr' },
  { pais: 'Nueva Zelanda', codigo: 'NZD', simbolo: '$' },
  { pais: 'Panamá', codigo: 'PAB', simbolo: 'B/.' },
  { pais: 'Paraguay', codigo: 'PYG', simbolo: '₲' },
  { pais: 'Perú', codigo: 'PEN', simbolo: 'S/' },
  { pais: 'Polonia', codigo: 'PLN', simbolo: 'zł' },
  { pais: 'Portugal', codigo: 'EUR', simbolo: '€' },
  { pais: 'Reino Unido', codigo: 'GBP', simbolo: '£' },
  { pais: 'República Dominicana', codigo: 'DOP', simbolo: '$' },
  { pais: 'Rusia', codigo: 'RUB', simbolo: '₽' },
  { pais: 'Sudáfrica', codigo: 'ZAR', simbolo: 'R' },
  { pais: 'Suiza', codigo: 'CHF', simbolo: 'Fr.' },
  { pais: 'Tailandia', codigo: 'THB', simbolo: '฿' },
  { pais: 'Turquía', codigo: 'TRY', simbolo: '₺' },
  { pais: 'Uruguay', codigo: 'UYU', simbolo: '$' },
  { pais: 'Venezuela', codigo: 'VES', simbolo: 'Bs.S' },
  { pais: 'Vietnam', codigo: 'VND', simbolo: '₫' }
];