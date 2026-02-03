import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DevolucionesComponent } from './devoluciones.component';
import { ListadoComponent } from './listado/listado.component';
import { ListadoAjusteDocumentoSoporteElectronicoComponent } from './listado-ajustes-documentos-soporte-electronico/listado.component';


const routes: Routes = [
  {
    path: '', component: DevolucionesComponent,
    children: [
      { path: '', component: ListadoComponent },
      { path: 'historialAjusteDocumentosSoporte/:type/:type_note', component: ListadoAjusteDocumentoSoporteElectronicoComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DevolucionesRoutingModule { }
