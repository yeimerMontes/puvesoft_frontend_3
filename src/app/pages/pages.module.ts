import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PagesRoutingModule } from './pages-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ChartModule } from 'angular-highcharts';

import { registerLocaleData } from '@angular/common';
import localeEsCo from '@angular/common/locales/es-CO';
import { NgSelectModule } from '@ng-select/ng-select';
import { PageComponent } from './page.component';
import { RenovarLicenciaComponent } from './renovar-licencia/renovar-licencia.component';
import { ReactiveFormsModule } from '@angular/forms';
registerLocaleData(localeEsCo);

@NgModule({
  declarations: [DashboardComponent, RenovarLicenciaComponent, PageComponent],
  imports: [
    CommonModule,
    ChartModule,
    PagesRoutingModule,
    NgSelectModule,
    ReactiveFormsModule,
  ],
  providers: [DatePipe, { provide: LOCALE_ID, useValue: 'es-CO' }],
})
export class PagesModule {}
