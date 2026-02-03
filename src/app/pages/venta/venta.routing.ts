import { DomiciliosComponent } from './domicilios/domicilios.component';
import { VentaRestauranteBarCompletarComponent } from './venta-restaurante-bar-completar/venta-restaurante-bar-completar.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VentaComponent } from './venta.component';

import { VentaRestauranteBarMesaComponent } from './venta-restaurante-bar-mesa/venta-restaurante-bar-mesa.component';
import { VentaRestauranteBarZonaComponent } from './venta-restaurante-bar-zona/venta-restaurante-bar-zona.component';
import { VentaTiendaComponent } from './venta-tienda/venta-tienda.component';
import { AperturaCajaGuard } from 'src/app/guards/apertura-caja.guard';
import { ValidaLicenciaGuard } from 'src/app/guards/valida-licencia.guard';
import { DetalleVentaComponent } from '../informe/detalle-venta/detalle-venta.component';


const routes: Routes = [
    {
        path: '', component: VentaComponent,
        children: [
            { path: '', redirectTo: 'second', pathMatch: 'full' },
            { path: 'ventarestaurantebar', component: VentaRestauranteBarZonaComponent, canActivate: [AperturaCajaGuard, ValidaLicenciaGuard]},
            { path: 'ventarestaurantebar/:idMesa', component: VentaRestauranteBarMesaComponent, canActivate: [AperturaCajaGuard, ValidaLicenciaGuard] },
            { path: 'ventarestaurantebar/:idFactura/completar', component: VentaRestauranteBarCompletarComponent, canActivate: [AperturaCajaGuard] },
            { path: 'domicilios', component: DomiciliosComponent},
            { path: 'ventatienda', component: VentaTiendaComponent, canActivate: [AperturaCajaGuard, ValidaLicenciaGuard]},
            { path: 'ventatienda/:idFactura/completar', component: VentaRestauranteBarCompletarComponent, canActivate: [AperturaCajaGuard] },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class VentaRoutingModule { }
