import { NgxPrintModule } from 'ngx-print';
import { GastoPorCategoriaComponent } from './gasto_por_categoria/gasto_por_categoria.component';
import { HistorialGastoComponent } from './historia-gastos/historial-gastos.component';
import {CategoriaGastoComponent } from './categoria-gastos/categoria-gastos.component';
import { GastoRoutingModule} from './gasto.routing';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { GastoComponent } from './gasto.component';
import { ComponentsModule } from 'src/app/components/components.module';
import { CommonModule } from '@angular/common';
import { GastoFijoComponent } from './gasto-fijo/gasto-fijo.component';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [GastoComponent, CategoriaGastoComponent,HistorialGastoComponent,GastoPorCategoriaComponent, GastoFijoComponent],
  imports: [
    CommonModule,
    ComponentsModule,
    GastoRoutingModule,
    ModalModule.forRoot(),
    ReactiveFormsModule,
    NgxPrintModule,
    NgxPaginationModule
  ],
})
export class GastoModule {}
