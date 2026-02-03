import { ComprasCompleteComponent } from './compras-complete/compras-complete.component';
import { ComprasIndexComponent } from './compras-index/compras-index.component';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { ComprasComponent } from './compras.component';
import { AperturaCajaGuard } from 'src/app/guards/apertura-caja.guard';
import { ValidaLicenciaGuard } from 'src/app/guards/valida-licencia.guard';

const routes: Routes = [
  {
    path: '',
    component: ComprasComponent,
    children: [
      {
        path: '',
        component: ComprasIndexComponent,
        canActivate: [AperturaCajaGuard, ValidaLicenciaGuard],
      },
      {
        path: ':idFactura/completar',
        component: ComprasCompleteComponent,
        canActivate: [AperturaCajaGuard, ValidaLicenciaGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComprasRoutingModule {}
