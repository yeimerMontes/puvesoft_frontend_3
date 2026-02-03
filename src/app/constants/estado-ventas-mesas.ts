export const headersEstadoVentaMesas = [
  {
    nombre: 'Item',
    accesor: '',
    style: "border: 1px solid rgb(70, 69, 69);padding-left: 10px;padding-right: 10px;text-align: center;",
  },
  {
    nombre: 'Mesa',
    accesor: 'nombre',
    style: "border: 1px solid rgb(70, 69, 69);padding-left: 10px;padding-right: 10px;",
  },
  {
    nombre: 'Cortesía',
    accesor: 'cortesia',
    number: true,
    style: "border: 1px solid rgb(70, 69, 69);padding-left: 10px;padding-right: 10px;text-align: right;",
  },
  {
    nombre: 'Propina',
    accesor: 'propina',
    number: true,
    style: "border: 1px solid rgb(70, 69, 69);padding-left: 10px;padding-right: 10px;text-align: right;",
  },
  {
    nombre: 'Valor venta sin propina',
    accesor: 'total_venta',
    number: true,
    style: "border: 1px solid rgb(70, 69, 69);padding-left: 10px;padding-right: 10px;text-align: right;",
  },
  {
    nombre: 'Valor venta con propina',
    accesor: 'total_venta_con_propina',
    number: true,
    style: "border: 1px solid rgb(70, 69, 69);padding-left: 10px;padding-right: 10px;text-align: right;",
  },
];
