import { DetalleClienteComponent } from './detalle-cliente/detalle-cliente.component';
import { ClienteListaComponent } from './cliente/cliente-lista.component';
import { ClienteRoutingModule } from './cliente.routing';

import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ClienteComponent } from './cliente.component';
import { CommonModule } from '@angular/common';
import { NgxPrintModule } from 'ngx-print';
import { ComponentsModule } from 'src/app/components/components.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { PipesModule } from 'src/app/pipes/pipes.module';

@NgModule({
  declarations: [
    ClienteComponent,
    ClienteListaComponent,
    DetalleClienteComponent,

  ],
  imports: [
    CommonModule,
    ClienteRoutingModule,
    ModalModule.forRoot(),
    ReactiveFormsModule,
    NgxPrintModule,
    ComponentsModule,
    NgxPaginationModule,
    PipesModule,
    
  ],
})
export class ClienteModule {}
