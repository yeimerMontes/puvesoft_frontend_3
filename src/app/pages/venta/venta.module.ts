import { DetalleVentaComponent } from './../informe/detalle-venta/detalle-venta.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { DomiciliosComponent } from './domicilios/domicilios.component';
import { VentaRoutingModule } from './venta.routing';

import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { VentaComponent } from './venta.component';
import { VentaRestauranteBarComponent } from './venta-restaurante-bar/venta-restaurante-bar.component';
import { VentaRestauranteBarZonaComponent } from './venta-restaurante-bar-zona/venta-restaurante-bar-zona.component';
import { VentaRestauranteBarMesaComponent } from './venta-restaurante-bar-mesa/venta-restaurante-bar-mesa.component';
import { VentaRestauranteBarPagarComponent } from './venta-restaurante-bar-pagar/venta-restaurante-bar-pagar.component';
import { VentaRestauranteBarCambiarMesaComponent } from './venta-restaurante-bar-cambiar-mesa/venta-restaurante-bar-cambiar-mesa.component';
import { VentaRestauranteBarCompletarComponent } from './venta-restaurante-bar-completar/venta-restaurante-bar-completar.component';
import { VentaTiendaComponent } from './venta-tienda/venta-tienda.component';
import { AperturaCajaGuard } from 'src/app/guards/apertura-caja.guard';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { ComponentsCarouselModule } from 'src/app/component-glide/components.carousel.module';
import { CommonModule } from '@angular/common';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { NgxPrintModule } from 'ngx-print';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [
    VentaComponent,
    VentaRestauranteBarComponent,
    VentaRestauranteBarZonaComponent,
    VentaRestauranteBarMesaComponent,
    VentaRestauranteBarPagarComponent,
    VentaRestauranteBarCambiarMesaComponent,
    VentaRestauranteBarCompletarComponent,
    DomiciliosComponent,
    VentaTiendaComponent,
  ],
  imports: [
    CommonModule,
    ComponentsModule,
    VentaRoutingModule,
    ModalModule.forRoot(),
    ReactiveFormsModule,
    ComponentsCarouselModule,
    PipesModule.forRoot(),
    NgSelectModule,
    PopoverModule,
    NgxPrintModule,
    NgxPaginationModule
  ],
  providers: [AperturaCajaGuard],
})
export class VentaModule {}
