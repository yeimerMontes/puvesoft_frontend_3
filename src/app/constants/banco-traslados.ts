/* Banco seguimiento */
export const headersBancoTraslados = [
  {
    nombre: 'Item',
    accesor: '',
    style:
      'border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: center;',
  },
  {
    nombre: 'Banco Origen',
    accesor: 'nombre_metodo_pago_origen',
    style:
      'border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: center;',
  },
  {
    nombre: 'Vlr Inicial',
    accesor: 'cantidad_origen_actual',
    style:
      'border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: right;',
    number: true,
  },

  {
    nombre: 'Vlr Movimiento',
    accesor: 'cantidad_origen_traslado',
    style:
      'border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: right;',
    number: true,
  },
  {
    nombre: 'Vlr Final',
    accesor: 'cantidad_origen_final',
    style:
      'border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: right;',
    number: true,
  },

  {
    nombre: 'Banco Destino',
    accesor: 'nombre_metodo_pago_destino',
    style:
      'border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: center;',
  },
  {
    nombre: 'Vlr Inicial',
    accesor: 'cantidad_destino_actual',
    style:
      'border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: right;',
    number: true,
  },

  {
    nombre: 'Vlr Movimiento',
    accesor: 'cantidad_destino_traslado',
    style:
      'border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: right;',
    number: true,
  },
  {
    nombre: 'Vlr Final',
    accesor: 'cantidad_destino_final',
    style:
      'border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: right;',
    number: true,
  },

  {
    nombre: 'Usuario',
    accesor: 'usuario',
    style:
      'border: 1px solid rgb(70, 69, 69);padding-left: 10px;text-align: center;',
  },

  {
    nombre: 'Fecha',
    accesor: 'created_at',
    style: 'border: 1px solid rgb(70, 69, 69);padding-left: 10px;',
  },
  {
    nombre: 'Observación',
    accesor: 'observacion',
    style: 'border: 1px solid rgb(70, 69, 69);padding-left: 10px;',
  },
];
