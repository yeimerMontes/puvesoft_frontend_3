import { GastoPorCategoriaComponent } from './gasto_por_categoria/gasto_por_categoria.component';
import { CategoriaGastoComponent } from './categoria-gastos/categoria-gastos.component';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GastoComponent } from './gasto.component';
import { HistorialGastoComponent } from './historia-gastos/historial-gastos.component';
import { GastoFijoComponent } from './gasto-fijo/gasto-fijo.component';

const routes: Routes = [
  {
    path: '',
    component: GastoComponent,
    children: [
      { path: '', redirectTo: 'categoriagastos', pathMatch: 'full' },
      { path: 'categoriagastos', component: CategoriaGastoComponent },
      { path: 'historialgastos', component: HistorialGastoComponent },
      { path: 'gastos-fijos', component: GastoFijoComponent },
      { path: 'gastoporcategoria', component: GastoPorCategoriaComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GastoRoutingModule {}
