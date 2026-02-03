import { NgxPrintModule } from 'ngx-print';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UtilidadesRoutingModule } from './utilidades-routing.module';
import { UtilidadesComponent } from './utilidades.component';
import { ListadoComponent } from './listado/listado.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ComponentsModule } from 'src/app/components/components.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [UtilidadesComponent, ListadoComponent],
  imports: [
    CommonModule,
    UtilidadesRoutingModule,
    ComponentsModule,
    NgMultiSelectDropDownModule.forRoot(),
    ModalModule.forRoot(),
    ReactiveFormsModule,
    NgxChartsModule,
    PipesModule,
    NgxPrintModule,
    NgxPaginationModule
  ],
})
export class UtilidadesModule {}
