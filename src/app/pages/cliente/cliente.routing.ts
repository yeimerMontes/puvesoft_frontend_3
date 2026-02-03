import { DetalleClienteComponent } from './detalle-cliente/detalle-cliente.component';
import { ClienteListaComponent } from './cliente/cliente-lista.component';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ClienteComponent } from './cliente.component';



const routes: Routes = [
    {
        path: '', component: ClienteComponent,
        children: [
            { path: '', redirectTo: 'listaclientes', pathMatch: 'full' },
            { path: 'listaclientes', component: ClienteListaComponent },
            { path: 'detallecliente/:idCliente', component: DetalleClienteComponent },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ClienteRoutingModule { }
