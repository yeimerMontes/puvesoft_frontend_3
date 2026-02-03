import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AbonarComponent } from './abonar/abonar.component';
import { ListadoComponent } from './listado/listado.component';

import { CreditosVentaComponent } from './creditos-venta.component';
import { ClientesCreditoComponent } from './clientes-credito/clientes-credito.component';
import { HistorialAbonosComponent } from './historial-abonos/historial-abonos.component';
import { AperturaCajaGuard } from 'src/app/guards/apertura-caja.guard';

const routes: Routes = [
  {
    path: '', component: CreditosVentaComponent,
    children: [
      { path: '', component: ListadoComponent },
      { path: 'abonar/:facturaId', component: AbonarComponent, canActivate: [AperturaCajaGuard] },
      { path: 'clientes', component: ClientesCreditoComponent },
      { path: 'historial-abonos', component: HistorialAbonosComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CreditosVentaRoutingModule { }
