import { SeguimientoProductoModule } from './seguimiento-producto.module';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListadoComponent } from './listado/listado.component';
import { SeguimientoProductoComponent } from './seguimiento-producto.component';


const routes: Routes = [
  {
    path: '', component: SeguimientoProductoComponent,
    children: [
      { path: '', component: ListadoComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SeguimientoProductoRoutingModule { }
