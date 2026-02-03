import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListadoComponent } from './listado/listado.component';
import { ImpuestosComponent } from './impuestoscomponent';

const routes: Routes = [
  {
    path: '', component: ImpuestosComponent,
    children: [
      { path: '', component: ListadoComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImpuestosRoutingModule { }
