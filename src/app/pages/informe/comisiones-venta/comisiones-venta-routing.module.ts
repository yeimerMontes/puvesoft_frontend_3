import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListadoComponent } from './listado/listado.component';
import { ComisionesVentaComponent } from './comisiones-venta.component';


const routes: Routes = [
  {
    path: '', component: ComisionesVentaComponent,
    children: [
      { path: '', component: ListadoComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ComisionesVentaRoutingModule { }
