import { ModalModule } from 'ngx-bootstrap/modal';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComprasIndexComponent } from './compras-index/compras-index.component';
import { ComprasCompleteComponent } from './compras-complete/compras-complete.component';
import { ComprasRoutingModule } from './compras-routing.module';
import { ComprasComponent } from './compras.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AperturaCajaGuard } from 'src/app/guards/apertura-caja.guard';
import { ComprasPaymentComponent } from './compras-payment/compras-payment.component';
import { ComponentsModule } from 'src/app/components/components.module';
import { NgSelectModule } from '@ng-select/ng-select';



@NgModule({
  declarations: [ComprasIndexComponent, ComprasCompleteComponent, ComprasComponent, ComprasPaymentComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ComprasRoutingModule,
    ModalModule.forRoot(),
    ReactiveFormsModule,
    ComponentsModule,
    NgSelectModule
  ],
  providers: [AperturaCajaGuard]
})
export class ComprasModule { }
