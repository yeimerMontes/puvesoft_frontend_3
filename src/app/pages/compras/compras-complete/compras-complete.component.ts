import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { TicketService } from 'src/app/services/ticket.service';

@Component({
  selector: 'app-compras-complete',
  templateUrl: './compras-complete.component.html',
})
export class ComprasCompleteComponent implements OnInit {
  factura = null;
  combinados = [];

  idInvoice = null;

  idFac = null;

  codigo = null;

  total = 0;

  data: any;
  showTicket = false;

  showInformationInvoice = false;

  isPaidInvoice = false;

  usarDecimales: Number = 1;

  canShowTotals = true;

  type = 1;

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private ticketService: TicketService,
    private funcionesService: FuncionesService
  ) {}

  ngOnInit(): void {
    this.idFac = this.activeRoute.snapshot.paramMap.get('idFactura');

    let sucursal = JSON.parse(decodeURIComponent(atob(localStorage.getItem(btoa('sucursal')))));
    this.usarDecimales = sucursal.usar_decimales;

    this.ticketService.getTicketInfoCompra(this.idFac).subscribe(
      (resp) => {
        //console.log(resp);
        this.total = resp.data.facturaCompra.total;

        this.factura = resp.data.facturaCompra;
        this.combinados = resp.data.combinados;
        this.codigo = resp.data.facturaCompra.cod_factura;

        this.data = resp.data;
        this.idInvoice = resp.data.facturaCompra.id;
        // this.showTicket = true;

        this.showInformationInvoice = this.factura.metodo_pago_id
          ? true
          : false;

        this.isPaidInvoice =
          this.factura.metodo_pago_id != null ||
          this.factura.estado_id == 5 || // cortesía
          this.factura.domiciliario_id != null;
        this.factura.cliente_id != null;

        // this.factura.metodo_pago_id = 10; // Combinado
      },
      (error) => {
        //console.log(error);
      }
    );
  }

  returnZones() {
    this.router.navigate(['/compras']);
  }

  imprimirTicket() {
    this.showTicket = true;
    this.canShowTotals = true;
    this.type = 1;
  }

  closeTicket(value: string) {
    this.showTicket = false;
  }

  idFactura = null;

  pagoCombinado(metodoPago) {
    if (this.combinados.length > 0) {
      let found = this.combinados.find(
        (item) => item.metodo_pago_id == metodoPago
      );
      if (found != null) {
        return found.valor;
      } else {
        return 0;
      }
    }
    return 0;
  }

  existePagoCombinado(metodoPago) {
    if (this.combinados.length > 0) {
      return this.combinados.find((item) => item.metodo_pago_id == metodoPago);
    }
    return null;
  }

  formatearNumber(valor) {
    return this.funcionesService.getFormatearNumero(valor, this.usarDecimales);
  }
}
