import { NgxPrintModule } from 'ngx-print';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VentasCategoriasRoutingModule } from './ventas-categorias-routing.module';
import { VentasCategoriasComponent } from './ventas-categorias.component';
import { ListadoComponent } from './listado/listado.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ChartModule } from 'angular-highcharts';
import { ComponentsModule } from 'src/app/components/components.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [VentasCategoriasComponent, ListadoComponent],
  imports: [
    CommonModule,
    VentasCategoriasRoutingModule,
    ComponentsModule,
    NgMultiSelectDropDownModule.forRoot(),
    ModalModule.forRoot(),
    ReactiveFormsModule,
    PipesModule,
    ChartModule,
    NgxPrintModule,
    NgxPaginationModule
  ],
})
export class VentasCategoriasModule {}
