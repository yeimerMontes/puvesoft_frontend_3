import { CotizacionCompleteComponent } from './cotizacion-complete/cotizacion-complete.component';
import { CotizacionIndexComponent } from './cotizacion-index/cotizacion-index.component';
import { CotizacionComponent } from './cotizacion.component';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AperturaCajaGuard } from 'src/app/guards/apertura-caja.guard';
import { ValidaLicenciaGuard } from 'src/app/guards/valida-licencia.guard';

const routes: Routes = [
  {
    path: '',
    component: CotizacionComponent,
    children: [
      // { path: '', redirectTo: 'second', pathMatch: 'full' },
      {
        path: '',
        component: CotizacionIndexComponent,
        canActivate: [AperturaCajaGuard, ValidaLicenciaGuard],
      },
      {
        path: ':idFactura/completar',
        component: CotizacionCompleteComponent,
        canActivate: [AperturaCajaGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CotizacionRoutingModule {}
