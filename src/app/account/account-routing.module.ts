import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { LoginAdminComponent } from './login_admin/login-admin.component';
import { AccesoDenegadoComponent } from './acceso_denegado/acceso-denegado.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'login-admin-panel',
    component: LoginAdminComponent,
  },
  {
    path: 'acceso-denegado',
    component: AccesoDenegadoComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountRoutingModule {}
