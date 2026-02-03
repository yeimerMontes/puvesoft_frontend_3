import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListadoComponent } from './listado/listado.component';
import { ComprobanteInformeDiarioCompraComponent } from './comprobante-informe-diario-compra.component';

const routes: Routes = [
  {
    path: '', component: ComprobanteInformeDiarioCompraComponent,
    children: [
      { path: '', component: ListadoComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComprobanteInformeDiarioCompraRoutingModule { }
