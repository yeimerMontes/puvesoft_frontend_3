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
import { ComprobanteInformeDiarioComponent } from './comprobante-informe-diario.component';
import { ComprobanteInformeDiarioRoutingModule } from './comprobante-informe-diario-routing.module';

@NgModule({
  declarations: [ComprobanteInformeDiarioComponent, ListadoComponent],
  imports: [
    CommonModule,
    ComprobanteInformeDiarioRoutingModule,
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
