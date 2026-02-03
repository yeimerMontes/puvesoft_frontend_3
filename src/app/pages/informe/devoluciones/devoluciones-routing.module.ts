import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DevolucionesComponent } from './devoluciones.component';
import { ListadoComponent } from './listado/listado.component';
import { ListadoPosElectronicoComponent } from './listado-pos-electronico/listado.component';


const routes: Routes = [
  {
    path: '', component: DevolucionesComponent,
    children: [
      { path: '', component: ListadoComponent },
      { path: 'historialNotaCredito/:type/:type_note', component: ListadoPosElectronicoComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DevolucionesRoutingModule { }
