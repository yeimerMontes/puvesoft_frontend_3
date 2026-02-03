import { NgxPrintModule } from 'ngx-print';
import { CreditosVentaRoutingModule } from './creditos-venta-routing.module';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { CreditosVentaComponent } from './creditos-venta.component';
import { ListadoComponent } from './listado/listado.component';
import { ClientesCreditoComponent } from './clientes-credito/clientes-credito.component';
import { HistorialAbonosComponent } from './historial-abonos/historial-abonos.component';
import { ComponentsModule } from 'src/app/components/components.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { AbonarComponent } from './abonar/abonar.component';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [
    CreditosVentaComponent,
    ListadoComponent,
    ClientesCreditoComponent,
    AbonarComponent,
    HistorialAbonosComponent,
  ],
  imports: [
    CreditosVentaRoutingModule,
    CommonModule,
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
export class CreditosVentaModule { }
