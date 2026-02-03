import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VentasCategoriasComponent } from './ventas-categorias.component';
import { ListadoComponent } from './listado/listado.component';


const routes: Routes = [
  {
    path: '', component: VentasCategoriasComponent,
    children: [
      { path: '', component: ListadoComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VentasCategoriasRoutingModule { }
