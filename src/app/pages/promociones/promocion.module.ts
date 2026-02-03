import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';
import { CommonModule } from '@angular/common';
import { NgxPrintModule } from 'ngx-print';
import { ComponentsModule } from 'src/app/components/components.module';
import { PromocionComponent } from './promocion.component';
import { PromocionRoutingModule } from './promocion.routing';
import { GestionPromocionComponent } from './gestion-promocion/gestion-promocion.component';
import { DetallePromocionComponent } from './detalle-promocion/detalle-promocion.component';
import { ProductoPromocionComponent } from './producto-promocion/producto-promocion.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxPaginationModule } from 'ngx-pagination';
import { ListadoPromocionComponent } from './listado/listado-promocion.component';
import { ResumenPromocionComponent } from './resumen-promocion/resumen-promocion.component';

@NgModule({
  declarations: [
    PromocionComponent,
    GestionPromocionComponent,
    DetallePromocionComponent,
    ProductoPromocionComponent,
    ListadoPromocionComponent,
    ResumenPromocionComponent
  ],
  imports: [
    CommonModule,
    PromocionRoutingModule,
    ModalModule.forRoot(),
    ReactiveFormsModule,
    NgxPrintModule,
    ComponentsModule,
    NgMultiSelectDropDownModule,
    NgxPaginationModule
  ],
})
export class PromocionModule {}
