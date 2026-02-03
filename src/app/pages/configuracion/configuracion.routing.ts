import { PuntosComponent } from './puntos/puntos.component';
import { DomiciliarioComponent } from './domiciliario/domiciliario.component';
import { MesaComponent } from './mesa/mesa.component';
import { UserComponent } from './user/user.component';
import { ZonaComponent } from './zona/zona.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProveedorComponent } from './proveedor/proveedor.component';
import { SucursalComponent } from './sucursal/sucursal.component';
import { ConfiguracionMenuComponent } from './configuracion.component';
import { EmpleadoComponent } from './empleados/empleado.component';
import { TipoRetencionComponent } from './tipo_retencion/tipo-retencion.component';

const routes: Routes = [
  {
    path: '',
    component: ConfiguracionMenuComponent,
    children: [
      { path: '', redirectTo: 'second', pathMatch: 'full' },
      { path: 'sucursal', component: SucursalComponent },
      { path: 'user', component: UserComponent },
      { path: 'proveedor', component: ProveedorComponent },
      { path: 'zona', component: ZonaComponent },
      { path: 'mesa', component: MesaComponent },
      { path: 'domiciliario', component: DomiciliarioComponent },
      { path: 'puntos', component: PuntosComponent },
      { path: 'empleados', component: EmpleadoComponent },
      { path: 'tipo_retencion', component: TipoRetencionComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SecondMenuRoutingModule {}
