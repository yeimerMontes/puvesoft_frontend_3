import { ComprobanteInformeDiarioModule } from './comprobante-informe-diario/comprobante-informe-diario.module';
import { InformeComponent } from './informe.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: '', component: InformeComponent,
        children: [
            { path: '', redirectTo: 'second', pathMatch: 'full' },
            { path: 'historialventa', loadChildren: () => import('./historial-venta/historial-venta.module').then(m => m.HistorialVentaModule)},
            { path: 'historialventaelectronica', loadChildren: () => import('./historial-venta-electronica/historial-venta-electronica.module').then(m => m.HistorialVentaElectronicaModule)},
            { path: 'nominaElectronica', loadChildren: () => import('./nomina-electronica/nomina-electronica.module').then(m => m.NominaElectronicaModule)},
            { path: 'historialventaposelectronico', loadChildren: () => import('./historial-venta-pos-electronico/historial-venta-pos-electronico.module').then(m => m.HistorialVentaPosElectronicaModule)},
            { path: 'estadoventa', loadChildren: () => import('./estado_venta/estado-venta.module').then(m => m.EstadoVentaModule)},
            { path: 'creditosventa', loadChildren: () => import('./creditos-venta/creditos-venta.module').then(m => m.CreditosVentaModule)},
            { path: 'devoluciones', loadChildren: () => import('./devoluciones/devoluciones.module').then(m => m.DevolucionesModule)},
            { path: 'cotizaciones', loadChildren: () => import('./cotizaciones/cotizaciones.module').then(m => m.CotizacionesModule)},
            { path: 'utilidades', loadChildren: () => import('./utilidades/utilidades.module').then(m => m.UtilidadesModule)},
            { path: 'ventasporcategoria', loadChildren: () => import('./ventas-categorias/ventas-categorias.module').then(m => m.VentasCategoriasModule)},
            { path: 'cerrarcaja', loadChildren: () => import('./cerrar-caja/cerrar-caja.module').then(m => m.CerrarCajaModule)},
            { path: 'historialcaja', loadChildren: () => import('./historial-caja/historial-caja.module').then(m => m.HistorialCajaModule)},
            { path: 'abrir-caja', loadChildren: () => import('./abrir-caja/abrir-caja.module').then(m => m.AbrirCajaModule)},
            { path: 'seguimiento-producto', loadChildren: () => import('./seguimiento-producto/seguimiento-producto.module').then(m => m.SeguimientoProductoModule)},
            { path: 'impuestos', loadChildren: () => import('./impuestos/impuestos.module').then(m => m.ImpuestosModule)},
            { path: 'detalleventa', loadChildren: () => import('./detalle-venta/detalle-venta.module').then(m => m.DetalleVentaModule)},
            { path: 'bancos', loadChildren: () => import('./bancos/bancos.module').then(m => m.BancosModule)},
            { path: 'comisionesVenta', loadChildren: () => import('./comisiones-venta/comisiones-venta.module').then(m => m.ComisionesVentaModule)},
            { path: 'comprobanteInformeDiario', loadChildren: () => import('./comprobante-informe-diario/comprobante-informe-diario.module').then(m => m.ComprobanteInformeDiarioModule)},


        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class InformeRoutingModule { }
