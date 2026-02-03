export const headersCreditoClientePdf = [
  {
    nombre: 'Item',
    accesor: '',
    style:
      'border: 1px solid rgb(70, 69, 69);padding-left: 10px;padding-right: 10px;text-align: center;',
  },
  {
    nombre: 'Factura',
    accesor: 'codigo_factura',
    style:
      'border: 1px solid rgb(70, 69, 69);padding-left: 10px;padding-right: 10px;text-align: center;',
  },
  {
    nombre: 'Fecha crédito',
    accesor: 'fecha_credito',
    style:
      'border: 1px solid rgb(70, 69, 69);padding-left: 10px;padding-right: 10px;',
  },
  {
    nombre: 'Tipo',
    accesor: 'credito',
    style:
      'border: 1px solid rgb(70, 69, 69);padding-left: 10px;padding-right: 10px;text-align: center;',
  },
  {
    nombre: 'Valor',
    accesor: 'valor_credito',
    style:
      'border: 1px solid rgb(70, 69, 69);padding-left: 10px;padding-right: 10px;text-align: right;',
    number: true,
  },
  {
    nombre: 'Abonos',
    accesor: 'valor',
    number: true,
    style:
      'border: 1px solid rgb(70, 69, 69);padding-left: 10px;padding-right: 10px;text-align: right;',
  },
  {
    nombre: 'Pendiente',
    accesor: 'restante',
    style:
      'border: 1px solid rgb(70, 69, 69);padding-left: 10px;padding-right: 10px;text-align: right;',
  }
];
