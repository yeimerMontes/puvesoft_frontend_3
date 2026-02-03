import { NgxPrintModule } from 'ngx-print';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SeguimientoProductoRoutingModule } from './seguimiento-producto-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ListadoComponent } from './listado/listado.component';
import { ComponentsModule } from 'src/app/components/components.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { SeguimientoProductoComponent } from './seguimiento-producto.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [
    ListadoComponent,
    SeguimientoProductoComponent
  ],
  imports: [
    SeguimientoProductoRoutingModule,
    CommonModule,
    ComponentsModule,
    ModalModule.forRoot(),
    ReactiveFormsModule,
    NgxChartsModule,
    PipesModule,
    NgxPrintModule,
    NgSelectModule,
    NgxPaginationModule

  ]
})
export class SeguimientoProductoModule { }
