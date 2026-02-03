import { NgxPrintModule } from 'ngx-print';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ComponentsModule } from 'src/app/components/components.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { ListadoElectronicoComponent } from './listado/listado.component';
import { NominaElectronicaComponent } from './nomina-electronica.component';
import { NominaElectronicaRoutingModule } from './nomina-electronica-routing.module';
import { NotaCreditoElectronicaComponent } from './nota-credito/nota-credito.component';
import { NotaDebitoElectronicaComponent } from './nota-debito/nota-debito.component';
import { DetalleNominaComponent } from './detalle-nomina/detalle-nomina.component';
import { ActualizarNominaComponent } from './actualizar-nomina/actualizar-nomina.component';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [
    NominaElectronicaComponent,
    ListadoElectronicoComponent,
    NotaCreditoElectronicaComponent,
    NotaDebitoElectronicaComponent,
    DetalleNominaComponent,
    ActualizarNominaComponent
  ],
  imports: [
    NominaElectronicaRoutingModule,
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
export class NominaElectronicaModule {}
