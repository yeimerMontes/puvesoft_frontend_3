import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UtilidadesComponent } from './utilidades.component';
import { ListadoComponent } from './listado/listado.component';

const routes: Routes = [
  {
    path: '', component: UtilidadesComponent,
    children: [
      { path: '', component: ListadoComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UtilidadesRoutingModule { }
