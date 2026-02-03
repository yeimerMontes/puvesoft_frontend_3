import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListadoElectronicoComponent } from './listado/listado.component';
import { NominaElectronicaComponent } from './nomina-electronica.component';
import { NotaCreditoElectronicaComponent } from './nota-credito/nota-credito.component';
import { NotaDebitoElectronicaComponent } from './nota-debito/nota-debito.component';
import { DetalleNominaComponent } from './detalle-nomina/detalle-nomina.component';
import { ActualizarNominaComponent } from './actualizar-nomina/actualizar-nomina.component';

const routes: Routes = [
  {
    path: '',
    component: NominaElectronicaComponent,
    children: [
      { path: '', component: ListadoElectronicoComponent },
      {
        path: 'notaCreditoElectronica/:facturaId',
        component: NotaCreditoElectronicaComponent,
      },
      {
        path: 'notaDebitoElectronica/:facturaId',
        component: NotaDebitoElectronicaComponent,
      },
      {
        path: 'detalle-nomina/:nominaId',
        component: DetalleNominaComponent,
      },
      {
        path: 'actualizar-nomina/:nominaId/:nominaEmpleadoId/:empleadoId',
        component: ActualizarNominaComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NominaElectronicaRoutingModule {}
