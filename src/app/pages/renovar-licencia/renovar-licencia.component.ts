import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardService } from 'src/app/services/dashboard.service';
import { FuncionesService } from 'src/app/services/funciones.service';
import { SucursalService } from 'src/app/services/sucursal.service';
import { Chart } from 'angular-highcharts';

@Component({
  selector: 'app-dashboard',
  templateUrl: './renovar-licencia.component.html',
  styleUrls: ['./renovar-licencia.component.css'],
})
export class RenovarLicenciaComponent {
  constructor(private activeRoute: ActivatedRoute) {}
  dia_vencimiento: any;

  ngOnInit() {
    this.dia_vencimiento = this.activeRoute.snapshot.queryParamMap.get('ven');
  }
}
