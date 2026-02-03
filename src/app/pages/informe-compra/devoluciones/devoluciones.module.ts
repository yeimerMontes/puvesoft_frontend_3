import { NgxPrintModule } from 'ngx-print';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ListadoComponent } from './listado/listado.component';
import { DevolucionesComponent } from './devoluciones.component';
import { DevolucionesRoutingModule } from './devoluciones-routing.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { ListadoAjusteDocumentoSoporteElectronicoComponent } from './listado-ajustes-documentos-soporte-electronico/listado.component';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [DevolucionesComponent, ListadoComponent, ListadoAjusteDocumentoSoporteElectronicoComponent],
  imports: [
    DevolucionesRoutingModule,
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
export class DevolucionesComprasModule {}
