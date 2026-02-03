import { NgxPrintModule } from 'ngx-print';
import { PuntosComponent } from './puntos/puntos.component';
import { UserComponent } from './user/user.component';

import { NgModule } from '@angular/core';
import { SecondMenuRoutingModule } from './configuracion.routing';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ConfiguracionMenuComponent } from './configuracion.component';
import { MesaComponent } from './mesa/mesa.component';
import { ZonaComponent } from './zona/zona.component';
import { ProveedorComponent } from './proveedor/proveedor.component';
import { SucursalComponent } from './sucursal/sucursal.component';
import { DomiciliarioComponent } from './domiciliario/domiciliario.component';
import { ComponentsModule } from 'src/app/components/components.module';
import { CommonModule } from '@angular/common';
import { QRCodeModule } from 'angularx-qrcode';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { EmpleadoComponent } from './empleados/empleado.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { TipoRetencionComponent } from './tipo_retencion/tipo-retencion.component';

@NgModule({
  declarations: [
    ConfiguracionMenuComponent,
    SucursalComponent,
    UserComponent, 
    ProveedorComponent, 
    ZonaComponent,
    MesaComponent,
    DomiciliarioComponent,
    PuntosComponent,
    EmpleadoComponent,
    TipoRetencionComponent
  ],
  imports: [
    CommonModule,
    ComponentsModule,
    SecondMenuRoutingModule,
    ModalModule.forRoot(),
    ReactiveFormsModule,
    NgxPrintModule,
    QRCodeModule,
    NgMultiSelectDropDownModule,
    NgxPaginationModule
  ]
})
export class ConfiguracionMenuModule { }
