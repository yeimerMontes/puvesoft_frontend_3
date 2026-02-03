import { InventarioCategoriaComponent } from './inventario_por_categoria/inventario_por_categoria.component';
import { AjusteInventarioComponent } from './ajuste-inventario/ajuste-inventario.component';
import { VerInventarioComponent } from './ver-inventario/ver-inventario.component';
import { ProductoBajaExistenciaComponent } from './producto/baja-existencia/producto-baja-existencia.component';
import { CategoriaProductoComponent } from './categoria/categoria-producto.component';
import { InventarioComponent } from './inventario.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProductoComponent } from './producto/producto.component';
import { MenuDigitalComponent } from './producto/menu-digital/menu-digital.component';
import { ProductoPorVencerComponent } from './producto/por-vencer/por-vencer.component';
import { BodegaComponent } from './bodega/bodega.component';
import { TrasladoBodegaComponent } from './traslado-bodega/traslado-bodega.component';
import { TrasladoSucursalComponent } from './traslado-sucursal/traslado-sucursal.component';
import { ProduccionComponent } from './produccion/produccion.component';

const routes: Routes = [
  {
    path: '',
    component: InventarioComponent,
    children: [
      { path: '', redirectTo: 'categoriaproducto', pathMatch: 'full' },
      { path: 'categoriaproducto', component: CategoriaProductoComponent },
      { path: 'producto', component: ProductoComponent },
      { path: 'menuDigital', component: MenuDigitalComponent },
      {
        path: 'productobajaexistencia',
        component: ProductoBajaExistenciaComponent,
      },
      { path: 'verinventario', component: VerInventarioComponent },
      { path: 'ajusteinventario', component: AjusteInventarioComponent },
      {
        path: 'inventarioporcategoria',
        component: InventarioCategoriaComponent,
      },
      { path: 'productoPorVencer', component: ProductoPorVencerComponent },
      { path: 'bodega', component: BodegaComponent },
      { path: 'trasladoBodega', component: TrasladoBodegaComponent },
      { path: 'trasladoSucursal', component: TrasladoSucursalComponent },
      { path: 'produccion', component: ProduccionComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FidelizacionRoutingModule {}
