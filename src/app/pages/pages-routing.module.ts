import { PromocionModule } from './promociones/promocion.module';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PageComponent } from './page.component';
import { RenovarLicenciaComponent } from './renovar-licencia/renovar-licencia.component';

const routes: Routes = [
  {
    path: '',
    component: PageComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'renovar-licencia', component: RenovarLicenciaComponent },
      {
        path: 'configuracion',
        loadChildren: () =>
          import('./configuracion/configuracion.module').then(
            (m) => m.ConfiguracionMenuModule
          ),
      },
      {
        path: 'inventario',
        loadChildren: () =>
          import('./inventario/inventario.module').then(
            (m) => m.InventarioModule
          ),
      },
      {
        path: 'vender',
        loadChildren: () =>
          import('./venta/venta.module').then((m) => m.VentaModule),
      },
      {
        path: 'cotizar',
        loadChildren: () =>
          import('./cotizacion/cotizacion.module').then(
            (m) => m.CotizacionModule
          ),
      },
      {
        path: 'cliente',
        loadChildren: () =>
          import('./cliente/cliente.module').then((m) => m.ClienteModule),
      },
      {
        path: 'gasto',
        loadChildren: () =>
          import('./gasto/gasto.module').then((m) => m.GastoModule),
      },
      {
        path: 'informe',
        loadChildren: () =>
          import('./informe/informe.module').then((m) => m.InformeModule),
      },
      {
        path: 'compras',
        loadChildren: () =>
          import('./compras/compras.module').then((m) => m.ComprasModule),
      },
      {
        path: 'informe-compras',
        loadChildren: () =>
          import('./informe-compra/informe-compra.module').then(
            (m) => m.InformeCompraModule
          ),
      },
      {
        path: 'promociones',
        loadChildren: () =>
          import('./promociones/promocion.module').then(
            (m) => m.PromocionModule
          ),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
