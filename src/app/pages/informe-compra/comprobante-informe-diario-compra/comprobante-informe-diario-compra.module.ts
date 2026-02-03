import { NgxPrintModule } from 'ngx-print';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ListadoComponent } from './listado/listado.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from 'src/app/components/components.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';
import { ComprobanteInformeDiarioCompraComponent } from './comprobante-informe-diario-compra.component';
import { ComprobanteInformeDiarioCompraRoutingModule } from './comprobante-informe-diario-compra-routing.module';

@NgModule({
  declarations: [ComprobanteInformeDiarioCompraComponent, ListadoComponent],
  imports: [
    CommonModule,
    ComprobanteInformeDiarioCompraRoutingModule,
    ComponentsModule,
    ModalModule.forRoot(),
    ReactiveFormsModule,
    PipesModule,
    NgxPrintModule,
    NgSelectModule,
    NgxPaginationModule
  ],
})
export class ComprobanteInformeDiarioModule {}
