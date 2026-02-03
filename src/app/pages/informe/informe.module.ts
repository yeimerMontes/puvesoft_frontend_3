import { NgxPrintModule } from 'ngx-print';
import { InformeComponent } from './informe.component';
import { InformeRoutingModule } from './informe.routing';
import { NgModule } from '@angular/core';

import { ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from 'src/app/components/components.module';
import { PipesModule } from 'src/app/pipes/pipes.module';

@NgModule({
  declarations: [InformeComponent],
  imports: [
    CommonModule,
    ComponentsModule,
    InformeRoutingModule,
    NgMultiSelectDropDownModule.forRoot(),
    ModalModule.forRoot(),
    ReactiveFormsModule,
    NgxChartsModule,
    PipesModule,
    NgxPrintModule
  ],
})
export class InformeModule {}
