import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListadoComponent } from './listado/listado.component';
import { BancosComponent } from './bancos.component';
import { DetalleComponent } from './detalle/detalle.component';
import { TrasladoComponent } from './traslado/traslado.component';


const routes: Routes = [
  {
    path: '', component: BancosComponent,
    children: [
      { path: '', component: ListadoComponent },
      { path: 'detalle', component: DetalleComponent },
      { path: 'traslado', component: TrasladoComponent },
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BancosRoutingModule { }
