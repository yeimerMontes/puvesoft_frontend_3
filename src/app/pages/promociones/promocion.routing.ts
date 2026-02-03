import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PromocionComponent } from './promocion.component';
import { GestionPromocionComponent } from './gestion-promocion/gestion-promocion.component';
import { ListadoPromocionComponent } from './listado/listado-promocion.component';



const routes: Routes = [
    {
        path: '', component: PromocionComponent,
        children: [
           { path: '', redirectTo: 'listado', pathMatch: 'full' },
            { path: 'listado', component: ListadoPromocionComponent },
            { path: 'gestionPromocion/:idGestion', component: GestionPromocionComponent },
            /* { path: 'detallecliente/:idCliente', component: DetalleClienteComponent }, */
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PromocionRoutingModule { }
