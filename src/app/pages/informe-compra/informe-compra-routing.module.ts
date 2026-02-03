import { ComprasCategoriasComponent } from './compras-categorias/compras-categorias.component';
import { HistorialAbonoCompraComponent } from './historial-abono-compra/historial-abono-compra.component';
import { CreditoCompraComponent } from './credito-compra/credito-compra.component';
import { HistorialCompraComponent } from './historial-compra/historial-compra.component';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { InformeCompraComponent } from './informe-compra.component';
import { ProveedorCreditoCompraComponent } from './proveedor-credito-compra/proveedor-credito-compra.component';
import { HistorialCompraDocumentoSoporteComponent } from './historial-compra-documentos-soporte/historial-compra-documentos-soporte.component';
import { DocumentoSoporteComponent } from './documento-soporte/documento-soporte.component';
import { RadianListadoComponent } from './radian-listado/radian-listado.component';

const routes: Routes = [
  {
    path: '',
    component: InformeCompraComponent,
    children: [
      { path: '', component: HistorialCompraComponent },
      { path: 'creditos', component: CreditoCompraComponent },
      {
        path: 'devoluciones',
        loadChildren: () =>
          import('./devoluciones/devoluciones.module').then(
            (m) => m.DevolucionesComprasModule
          ),
      },
      { path: 'proveedores', component: ProveedorCreditoCompraComponent },
      { path: 'historial-abonos', component: HistorialAbonoCompraComponent },
      { path: 'compras-categorias', component: ComprasCategoriasComponent },
      {
        path: 'documentos-soportes',
        component: HistorialCompraDocumentoSoporteComponent,
      },
      {
        path: 'detallecompras',
        loadChildren: () =>
          import('./detalle-compra/detalle-compra.module').then(
            (m) => m.DetalleCompraModule
          ),
      },
      {
        path: 'documentos-soportes/:facturaId',
        component: DocumentoSoporteComponent,
      },
      { path: 'radian', component: RadianListadoComponent },
      {
        path: 'comprobanteInformeDiarioCompra',
        loadChildren: () =>
          import(
            './comprobante-informe-diario-compra/comprobante-informe-diario-compra.module'
          ).then((m) => m.ComprobanteInformeDiarioModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InformeCompraRoutingModule {}
