import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListadoComponent } from './listado/listado.component';
import { ComprobanteInformeDiarioComponent } from './comprobante-informe-diario.component';

const routes: Routes = [
  {
    path: '', component: ComprobanteInformeDiarioComponent,
    children: [
      { path: '', component: ListadoComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComprobanteInformeDiarioRoutingModule { }
