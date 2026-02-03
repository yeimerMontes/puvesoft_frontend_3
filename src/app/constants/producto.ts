export const headersProducto = [
  {
    nombre: 'Item',
    accesor: '',
    style: "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: center;",
  },
  {
    nombre: 'Código de barras',
    accesor: 'cod_barra',
    style: "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: center;",
  },
  {
    nombre: 'Nombre',
    accesor: 'nombre',
    style: "border: 1px solid rgb(70, 69, 69);padding-left: 10px;",
  },
  {
    nombre: 'Stock',
    accesor: 'stock',
    style: "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: right",
    number: true,
  },
  {
    nombre: 'Unidad Med',
    accesor: 'medida',
    style: "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: center;",
  },
  {
    nombre: 'Valor compra',
    accesor: 'valor_compra',
    style: "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: right;",
    number: true,
  },
  {
    nombre: 'Valor venta',
    accesor: 'valor_venta',
    style: "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: right;",
    number: true,
  },
  {
    nombre: 'Fecha vencimiento',
    accesor: 'fecha_vencimiento',
    style: "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: right;",
  },
  {
    nombre: 'Producto',
    accesor: 'producto',
    style: "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: center;",
  },
  {
    nombre: 'Insumo',
    accesor: 'insumo',
    style: "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: center;",
  },
  {
    nombre: 'Receta Sevicio Combo',
    accesor: 'receta_combo_servicio',
    style: "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: center;",
  },
  {
    nombre: 'ESTADO',
    accesor: 'estado',
    style: "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: center;",
  },
];

export const headersProductoBajaExistencia = [
  {
    nombre: 'Item',
    accesor: '',
    style: "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: center;",
  },
  {
    nombre: 'Código de Barras',
    accesor: 'cod_barra',
    style: "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: center;",
  },
  {
    nombre: 'Nombre del Producto',
    accesor: 'nombre',
    style: "border: 1px solid rgb(70, 69, 69);padding-left: 10px;",
  },
  {
    nombre: 'Stock',
    accesor: 'stock',
    style: "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: center;",
    number: true,
  },
  {
    nombre: 'Unidad de Medida',
    accesor: 'nombre_medida',
    style: "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: center;",
  },
  {
    nombre: 'Valor de Compra',
    accesor: 'valor_compra',
    style: "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: rigth;",
    number: true,
  },
  {
    nombre: 'Valor de Venta',
    accesor: 'valor_venta',
    style: "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: rigth;",
    number: true,
  },
  {
    nombre: 'Producto',
    accesor: 'producto',
    style: "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: center;",
  },
  {
    nombre: 'Insumo',
    accesor: 'insumo',
    style: "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: center;",
  },
  {
    nombre: 'Estado',
    accesor: 'estado_id',
    style: "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: center;",
  },
];

/* Inventario */
export const headersInventario = [
  {
    nombre: 'Item',
    accesor: '',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: center;",
  },
  {
    nombre: 'Código de Barras',
    accesor: 'cod_barra',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: center;",
  },
  {
    nombre: 'Nombre del Producto',
    accesor: 'nombre',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;",
  },
  {
    nombre: 'Stock',
    accesor: 'stock',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: right;",
    number: true
  },
  {
    nombre: 'Valor de Compra',
    accesor: 'valor_compra',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: right;",
    number: true
  },
  {
    nombre: 'Total Costo',
    accesor: 'total_costo',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: right;",
    number: true
  },
  {
    nombre: 'Valor de Venta',
    accesor: 'valor_venta',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: right;",
    number: true
  },
  {
    nombre: 'Total Venta',
    accesor: 'total_venta',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: right;",
    number: true
  }
];


/* Ajuste de inventario */
export const headersAjusteInventario = [
  {
    nombre: 'Item',
    accesor: '',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: center;",
  },
  {
    nombre: 'Cód Ajuste',
    accesor: 'cod_ajuste',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: center;",
  },
  {
    nombre: 'Producto',
    accesor: 'nombre_bodega',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;",
  },
  {
    nombre: 'Fecha y Hora',
    accesor: 'fecha',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: center;",
  },
  {
    nombre: 'Producto',
    accesor: 'nombre_producto',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;",
  },
 
  {
    nombre: 'Cabtidad Actual',
    accesor: 'cantidad_actual',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: right;",
    number: true,
  },
  {
    nombre: 'Candidad Ajustada',
    accesor: 'cantidad',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: right;",
    number: true,
  },
  {
    nombre: 'Candidad Final',
    accesor: 'cantidad_final',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: right;",
    number: true,
  },
  {
    nombre: 'Tipo',
    accesor: 'tipo',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: center;",
  },
  {
    nombre: 'Valor del Ajuste',
    accesor: 'valor_ajuste',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: right;",
    number: true,
  },
  {
    nombre: 'Responsable',
    accesor: 'nombre_usuario',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;",
  },
  {
    nombre: 'Observación',
    accesor: 'observacion',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;",
  },
  {
    nombre: 'Estado',
    accesor: 'estado_id',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: center;",
  },
];

/* Traslados entre bodegas */
export const headersTrasladosBodega = [
  {
    nombre: 'Item',
    accesor: '',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: center;",
  },
  {
    nombre: 'Cód traslado',
    accesor: 'cod_traslado',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: center;",
  },
  {
    nombre: 'Bodega Origen',
    accesor: 'nombre_bodega_origen',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;",
  },
  {
    nombre: 'Bodega Destino',
    accesor: 'nombre_bodega_destino',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;",
  },
  {
    nombre: 'Producto',
    accesor: 'nombre_bodega',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;",
  },

  {
    nombre: 'Producto',
    accesor: 'nombre_producto',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;",
  },
 
  {
    nombre: 'Cantidad Actual',
    accesor: 'cantidad_actual',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: right;",
    number: true,
  },
  {
    nombre: 'Candidad Traslado',
    accesor: 'cantidad_traslado',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: right;",
    number: true,
  },
  {
    nombre: 'Candidad Final',
    accesor: 'cantidad_final',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: right;",
    number: true,
  },
 /*  {
    nombre: 'Valor del Ajuste',
    accesor: 'valor_ajuste',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: right;",
    number: true,
  }, */
  {
    nombre: 'Responsable',
    accesor: 'nombre_usuario',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;",
  },
  {
    nombre: 'Observación',
    accesor: 'observacion',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;",
  },
  {
    nombre: 'Fecha y Hora',
    accesor: 'fecha',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: center;",
  },
  {
    nombre: 'Estado',
    accesor: 'estado_id',
    style:  "border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: center;",
  },
];

