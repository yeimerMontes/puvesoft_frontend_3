import { NgxPrintModule } from 'ngx-print';
import { InventarioCategoriaComponent } from './inventario_por_categoria/inventario_por_categoria.component';
import { AjusteInventarioComponent } from './ajuste-inventario/ajuste-inventario.component';
import { VerInventarioComponent } from './ver-inventario/ver-inventario.component';
import { ProductoBajaExistenciaComponent } from './producto/baja-existencia/producto-baja-existencia.component';
import { ProductoComponent } from './producto/producto.component';
import { CategoriaProductoComponent } from './categoria/categoria-producto.component';
import { InventarioComponent } from './inventario.component';
import { FidelizacionRoutingModule } from './inventario.routing';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ComponentsModule } from 'src/app/components/components.module';
import { ChartModule } from 'angular-highcharts';
import { NgSelectModule } from '@ng-select/ng-select';
import { MenuDigitalComponent } from './producto/menu-digital/menu-digital.component';
import { ProductoPorVencerComponent } from './producto/por-vencer/por-vencer.component';
import { BodegaComponent } from './bodega/bodega.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { TrasladoBodegaComponent } from './traslado-bodega/traslado-bodega.component';
import { TrasladoSucursalComponent } from './traslado-sucursal/traslado-sucursal.component';
import { ProduccionComponent } from './produccion/produccion.component';

@NgModule({
  declarations: [
    InventarioComponent,
    CategoriaProductoComponent,
    ProductoComponent,
    ProductoBajaExistenciaComponent,
    VerInventarioComponent,
    AjusteInventarioComponent,
    InventarioCategoriaComponent,
    MenuDigitalComponent,
    ProductoPorVencerComponent,
    BodegaComponent,
    TrasladoBodegaComponent,
    TrasladoSucursalComponent,
    ProduccionComponent
  ],
  imports: [
    ComponentsModule,
    FidelizacionRoutingModule,
    NgMultiSelectDropDownModule,
    ModalModule.forRoot(),
    ReactiveFormsModule,
    NgxChartsModule,
    ChartModule,
    NgxPrintModule,
    NgSelectModule,
    NgxPaginationModule

  ]
})



export class InventarioModule { }
