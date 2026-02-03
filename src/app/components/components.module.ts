import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketCompraComponent } from './ticket-compra/ticket-compra.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AperturaCajaComponent } from './apertura-caja/apertura-caja.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TicketComponent } from './ticket/ticket.component';
import { TicketCotizacionComponent } from './ticket-cotizacion/ticket-cotizacion.component';
import { TicketAbonosComponent } from './ticket-abonos/ticket-abonos.component';
import { TicketDevolucionComponent } from './ticket-devolucion/ticket-devolucion.component';
import { TicketCajaComponent } from './ticket-caja/ticket-caja.component';
import { ReporteTablasMaestras } from './report-master-tables/report-master-tables.component';
import { PipesModule } from '../pipes/pipes.module';
import { QRCodeModule } from 'angularx-qrcode';
import { TicketAbonosCompraComponent } from './ticket-abonos-compra/ticket-abonos-compra.component';
import { TicketDevolucionCompraComponent } from './ticket-devolucion-compra/ticket-devolucion.component';
import { TicketGastoComponent } from './ticket-gasto/ticket-gasto.component';
import { CotizacionPaymentComponent } from './cotizacion-payment/cotizacion-payment.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { OpcionesHistorialVentaComponent } from './opciones-historial-venta/listado.component';
import { OpcionesHistorialDevolucionesComponent } from './opciones-historial-devoluciones/listado.component';
import { TicketVentaCartaComponent } from './ticket-venta-carta/ticket-venta-carta.component';
import { DetalleItemNotaCreditoComponent } from './detalle-item-nota-credito/detalle-item-nota-credito.component';
import { OpcionesHistorialCompraComponent } from './opciones-historial-compra/listado.component';
import { TicketNotaCreditoComponent } from './ticket-nota-credito/ticket-nota-credito.component';
import { OpcionesHistorialDevolucionesComprasComponent } from './opciones-historial-devoluciones-compras/listado.component';


@NgModule({
  declarations: [
    TicketComponent,
    AperturaCajaComponent,
    TicketCompraComponent,
    TicketCotizacionComponent,
    TicketAbonosComponent,
    TicketDevolucionComponent,
    TicketCajaComponent,
    ReporteTablasMaestras,
    TicketAbonosCompraComponent,
    TicketDevolucionCompraComponent,
    TicketGastoComponent,
    CotizacionPaymentComponent,
    OpcionesHistorialVentaComponent,
    OpcionesHistorialCompraComponent,
    OpcionesHistorialDevolucionesComponent,
    OpcionesHistorialDevolucionesComprasComponent,
    TicketVentaCartaComponent,
    DetalleItemNotaCreditoComponent,
    TicketNotaCreditoComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    PipesModule,
    QRCodeModule,
    NgSelectModule,
  ],
  exports: [
    TicketComponent,
    AperturaCajaComponent,
    TicketCompraComponent,
    TicketCotizacionComponent,
    TicketAbonosComponent,
    TicketDevolucionComponent,
    TicketCajaComponent,
    ReporteTablasMaestras,
    TicketAbonosCompraComponent,
    TicketDevolucionCompraComponent,
    TicketGastoComponent,
    CotizacionPaymentComponent,
    OpcionesHistorialVentaComponent,
    OpcionesHistorialCompraComponent,
    OpcionesHistorialDevolucionesComponent,
    OpcionesHistorialDevolucionesComprasComponent,
    TicketVentaCartaComponent,
    DetalleItemNotaCreditoComponent,
    TicketNotaCreditoComponent
  ],
})
export class ComponentsModule { }
