import { Component, OnInit, Input, Inject } from '@angular/core';
import { SucursalService } from 'src/app/services/sucursal.service';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';
import { FuncionesService } from 'src/app/services/funciones.service';
import { DOCUMENT } from '@angular/common';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'report-master-tables',
  templateUrl: './report-master-tables.component.html',
  styleUrls: ['./report-master-tables.component.css', '../../css/modulo.css'],
})
export class ReporteTablasMaestras implements OnInit {
  @Input() titleHeader: String;
  @Input() colspanHeader: String;
  @Input() title: String;
  @Input() data: any[];
  @Input() total: any;
  @Input() total_venta: any;
  @Input() fecha_inicial: string;
  @Input() fecha_final: string;
  @Input() hora_inicial: string;
  @Input() hora_final: string;
  @Input() page: number;
  @Input() headers: headersMasterInterface[];
  sucursal: any;

  @Input() inventario: boolean;
  @Input() historialGasto: boolean;
  @Input() historialVenta: boolean;
  @Input() estadoVenta: boolean;
  @Input() estadoVentaMetodoPago: boolean;
  @Input() estadoVentaMesa: boolean;
  @Input() creditoVenta: boolean;
  @Input() creditoClientes: boolean;
  @Input() historialAbono: boolean;
  @Input() devoluciones: boolean;
  @Input() utilidades: boolean;
  @Input() historialCompra: boolean;
  @Input() creditoCompra: boolean;
  @Input() detalleVenta: boolean;
  @Input() detalleCompra: boolean;
  @Input() devolucionNotaCredito: boolean;
  @Input() bancoSeguimiento: boolean;
  @Input() bancoTraslados: boolean;
  @Input() listadoNominaElectronica: boolean;
  @Input() comisionVenta: boolean;
  @Input() creditoClientesPdf: boolean;
  

  website = '';

  constructor(
    private sucursalService: SucursalService,
    private funcionesService: FuncionesService,
    @Inject(DOCUMENT) document: any
    ) {
      
      let hostname = document.location.hostname;
  
      let environmentConfig = environment[hostname];

      this.website = environmentConfig.website;
    }

  ngOnInit(): void {
    this.getSucural();

   // console.log(this.data)
  }

  formatearNumber(valor) {
    return this.funcionesService.getFormatearNumero(
      valor,
      this.sucursal.usarDecimales
    );
  }

  /* Consulto informacion de sucursal */
  public getSucural() {
    try {
      this.sucursal = JSON.parse(decodeURIComponent(atob(localStorage.getItem(btoa('sucursal')))));
    } catch (error) {
      this.sucursal = '';
    }
    if (!this.sucursal) {
      this.sucursalService.getSucursal().subscribe((resp) => {
        this.sucursal = resp.data;
        //console.log(resp)
        localStorage.setItem(btoa('sucursal'), btoa(JSON.stringify(resp.data)));
      });
    }
  }
}
