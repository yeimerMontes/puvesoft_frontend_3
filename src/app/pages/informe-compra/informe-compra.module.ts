import { ComprasCategoriasComponent } from './compras-categorias/compras-categorias.component';
import { NgxPrintModule } from 'ngx-print';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InformeCompraComponent } from './informe-compra.component';
import { HistorialCompraComponent } from './historial-compra/historial-compra.component';
import { CreditoCompraComponent } from './credito-compra/credito-compra.component';
import { InformeCompraRoutingModule } from './informe-compra-routing.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AbonorCompraComponent } from './abonor-compra/abonor-compra.component';
import { ComponentsModule } from 'src/app/components/components.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { HistorialAbonoCompraComponent } from './historial-abono-compra/historial-abono-compra.component';
import { ProveedorCreditoCompraComponent } from './proveedor-credito-compra/proveedor-credito-compra.component';
import { ChartModule } from 'angular-highcharts';
import { HistorialCompraDocumentoSoporteComponent } from './historial-compra-documentos-soporte/historial-compra-documentos-soporte.component';
import { DocumentoSoporteComponent } from './documento-soporte/documento-soporte.component';
import { RadianListadoComponent } from './radian-listado/radian-listado.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ComprobanteInformeDiarioComponent } from '../informe/comprobante-informe-diario/comprobante-informe-diario.component';

@NgModule({
  declarations: [
    InformeCompraComponent,
    HistorialCompraComponent,
    CreditoCompraComponent,
    AbonorCompraComponent,
    HistorialAbonoCompraComponent,
    ProveedorCreditoCompraComponent,
    ComprasCategoriasComponent,
    HistorialCompraDocumentoSoporteComponent,
    DocumentoSoporteComponent,
    RadianListadoComponent,
  ],
  imports: [
    CommonModule,
    InformeCompraRoutingModule,
    ComponentsModule,
    NgMultiSelectDropDownModule.forRoot(),
    ModalModule.forRoot(),
    ReactiveFormsModule,
    ChartModule,
    PipesModule,
    NgxPrintModule,
    NgxPaginationModule  

  ],
})
export class InformeCompraModule {}
