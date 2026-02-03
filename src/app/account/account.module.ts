import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { AccountRoutingModule } from './account-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { LoginAdminComponent } from './login_admin/login-admin.component';
import { AccesoDenegadoComponent } from './acceso_denegado/acceso-denegado.component';




@NgModule({
  declarations: [
    LoginComponent,
    LoginAdminComponent,
    AccesoDenegadoComponent
  ],
  imports: [
    CommonModule,
    AccountRoutingModule,

    ReactiveFormsModule,
    ModalModule.forRoot()

  ]
})
export class AccountModule { }
