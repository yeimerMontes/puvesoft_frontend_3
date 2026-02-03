import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { MesaService } from 'src/app/services/mesa.service';
import { TicketService } from 'src/app/services/ticket.service';

@Component({
  selector: 'app-cotizacion-complete',
  templateUrl: './cotizacion-complete.component.html',
  styleUrls: ['./cotizacion-complete.component.scss']
})
export class CotizacionCompleteComponent implements OnInit {

  isPaymentVisible = false;
  mesa = null;
  mesaAtendida: String;
  factura = null;
  combinados = [];

  idInvoice = null;

  idFac = null;

  codigo = null;

  propina = null;

  precio = 0;

  total = 0;

  data: any;
  showTicket = false;

  showInformationInvoice = false;

  isPaidInvoice = false;

  usarDecimales: Number = 1;

  canShowTotals = true;
  
  tipoSucursal = 1;

  type = 1;

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private mesaService: MesaService,
    private ticketService: TicketService,
    private funcionesService: FuncionesService
  ) {}

  ngOnInit(): void {
    this.idFac = this.activeRoute.snapshot.paramMap.get('idFactura');

    let sucursal = JSON.parse(decodeURIComponent(atob(localStorage.getItem(btoa('sucursal')))));
    
    this.tipoSucursal = (sucursal) ? sucursal.tipo_sucursal : 1;
    
    this.usarDecimales = sucursal.usar_decimales;

    this.ticketService.getTicketInfoCotizacion(this.idFac).subscribe(
      (resp) => {
        //console.log(resp);
        this.propina = resp.data.facturaVenta.propina;
        this.total = resp.data.facturaVenta.total_with_tip;

        this.mesaAtendida = resp.data.facturaVenta.mesa_id;
        this.factura = resp.data.facturaVenta;
        this.combinados = resp.data.combinados;
        this.codigo = resp.data.facturaVenta.cod_factura;

        this.precio = resp.data.facturaVenta.total;

        this.data = resp.data;
        this.idInvoice = resp.data.facturaVenta.id;
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
    this.router.navigate(['/cotizar']);
  }

  returnSales() {
    if (this.tipoSucursal == 1) {
      this.router.navigate(['/vender/ventatienda']);
    } else {
      this.router.navigate(['/vender/ventarestaurantebar']);
    }
  }

  imprimirTicket() {
    this.showTicket = true;
    this.canShowTotals = true;
    this.type = 1;
  }

  closeTicket(value: string) {
    this.showTicket = false;
  }

  public proccessEditEvent(id: string) {
    this.isPaymentVisible = false;
  }

  public reloadEditEvent(id: string) {
    this.isPaymentVisible = false;
    this.ngOnInit();
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
