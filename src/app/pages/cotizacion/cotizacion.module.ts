import { CotizacionRoutingModule } from './cotizacion-routing.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CotizacionIndexComponent } from './cotizacion-index/cotizacion-index.component';
import { CotizacionCompleteComponent } from './cotizacion-complete/cotizacion-complete.component';
import { CotizacionComponent } from './cotizacion.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgSelectModule } from '@ng-select/ng-select';
import { ComponentsModule } from 'src/app/components/components.module';



@NgModule({
  declarations: [CotizacionIndexComponent, CotizacionCompleteComponent, CotizacionComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ModalModule,
    NgSelectModule,


    ComponentsModule,
    CotizacionRoutingModule,

  ]
})
export class CotizacionModule { }
