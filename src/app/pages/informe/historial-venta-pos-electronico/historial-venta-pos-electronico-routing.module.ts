import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListadoPosElectronicoComponent } from './listado/listado.component';
import { HistorialVentaPosElectronicoComponent } from './historial-venta-pos-electronico.component';
import { NotaAjustePosElectronicaComponent } from './nota-credito/nota-credito.component';

const routes: Routes = [
  {
    path: '',
    component: HistorialVentaPosElectronicoComponent,
    children: [{ path: '', component: ListadoPosElectronicoComponent },
    {
      path: 'notaAjustePosElectronico/:facturaId',
      component: NotaAjustePosElectronicaComponent,
    },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HistorialVentaPosElectronicoRoutingModule { }
