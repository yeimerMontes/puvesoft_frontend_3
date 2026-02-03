import { NgxPrintModule } from 'ngx-print';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BancosRoutingModule } from './bancos-routing.module';
import { BancosComponent } from './bancos.component';
import { ListadoComponent } from './listado/listado.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ChartModule } from 'angular-highcharts';
import { ComponentsModule } from 'src/app/components/components.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { DetalleComponent } from './detalle/detalle.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgSelectModule } from '@ng-select/ng-select';
import { TrasladoComponent } from './traslado/traslado.component';

@NgModule({
  declarations: [BancosComponent, ListadoComponent, DetalleComponent, TrasladoComponent],
  imports: [
    CommonModule,
    ComponentsModule,
    BancosRoutingModule,
    ComponentsModule,
    NgMultiSelectDropDownModule.forRoot(),
    ModalModule.forRoot(),
    ReactiveFormsModule,
    PipesModule,
    ChartModule,
    NgxPrintModule,
    NgSelectModule,
    NgxPaginationModule
  ],
})
export class BancosModule {}
