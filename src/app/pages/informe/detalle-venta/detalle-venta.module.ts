import { NgxPrintModule } from 'ngx-print';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ListadoComponent } from './listado/listado.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ComponentsModule } from 'src/app/components/components.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { DetalleVentaComponent } from './detalle-venta.component';
import { DetalleVentaRoutingModule } from './detalle-venta-routing.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [DetalleVentaComponent, ListadoComponent],
  imports: [
    CommonModule,
    DetalleVentaRoutingModule,
    ComponentsModule,
    ModalModule.forRoot(),
    ReactiveFormsModule,
    PipesModule,
    NgxPrintModule,
    NgSelectModule,
    NgxPaginationModule
  ],
})
export class DetalleVentaModule {}
