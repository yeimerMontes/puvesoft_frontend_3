import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListadoElectronicoComponent } from './listado/listado.component';
import { HistorialVentaElectronicaComponent } from './historial-venta-electronica.component';
import { NotaCreditoElectronicaComponent } from './nota-credito/nota-credito.component';
import { NotaDebitoElectronicaComponent } from './nota-debito/nota-debito.component';

const routes: Routes = [
  {
    path: '',
    component: HistorialVentaElectronicaComponent,
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
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HistorialVentaElectronicaRoutingModule {}
