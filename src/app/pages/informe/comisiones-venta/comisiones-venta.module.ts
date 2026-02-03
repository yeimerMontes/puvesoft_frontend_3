import { NgxPrintModule } from 'ngx-print';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ListadoComponent } from './listado/listado.component';
import { ComponentsModule } from 'src/app/components/components.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { ComisionesVentaComponent } from './comisiones-venta.component';
import { ComisionesVentaRoutingModule } from './comisiones-venta-routing.module';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [
    ListadoComponent,
    ComisionesVentaComponent
  ],
  imports: [
    CommonModule,
    ComisionesVentaRoutingModule,
    ComponentsModule,
    NgMultiSelectDropDownModule.forRoot(),
    ModalModule.forRoot(),
    ReactiveFormsModule,
    NgxChartsModule,
    PipesModule,
    NgxPrintModule,
    NgxPaginationModule
  ]
})
export class ComisionesVentaModule { }
