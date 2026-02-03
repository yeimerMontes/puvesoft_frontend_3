import { NgxPrintModule } from 'ngx-print';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ComponentsModule } from 'src/app/components/components.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { HistorialVentaPosElectronicoRoutingModule } from './historial-venta-pos-electronico-routing.module';
import { ListadoPosElectronicoComponent } from './listado/listado.component';
import { HistorialVentaPosElectronicoComponent } from './historial-venta-pos-electronico.component';
import { NotaAjustePosElectronicaComponent } from './nota-credito/nota-credito.component';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [
    HistorialVentaPosElectronicoComponent,
    ListadoPosElectronicoComponent,
    NotaAjustePosElectronicaComponent
  ],
  imports: [
    HistorialVentaPosElectronicoRoutingModule,
    CommonModule,
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
export class HistorialVentaPosElectronicaModule {}
