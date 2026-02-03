import { MesaService } from 'src/app/services/mesa.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, Inject, OnInit } from '@angular/core';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { TicketService } from 'src/app/services/ticket.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-venta-restaurante-bar-completar',
  templateUrl: './venta-restaurante-bar-completar.component.html',
  styleUrls: ['./venta-restaurante-bar-completar.component.scss'],
})
export class VentaRestauranteBarCompletarComponent implements OnInit {
  isPaymentVisible = false;
  mesa = null;
  mesaAtendida: String;
  factura = null;
  combinados = [];

  idInvoice = null;

  idFac = null;

  codigo = null;

  propina = null;

  total_bolsa = 0;

  precio = 0;

  total = 0;

  data: any;
  showTicket = false;
  showTicketCarta = false;

  showInformationInvoice = false;

  isPaidInvoice = false;

  usarDecimales: Number = 1;

  canShowTotals = true;

  type = 1;

  imprimir_ticket = false;
  formato_ticket = false;

  domicilio = 0;

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private mesaService: MesaService,
    private ticketService: TicketService,
    private funcionesService: FuncionesService,
    @Inject(DOCUMENT) document: any
  ) {}

  ngOnInit(): void {
    this.idFac = this.activeRoute.snapshot.paramMap.get('idFactura');

    let sucursal = JSON.parse(decodeURIComponent(atob(localStorage.getItem(btoa('sucursal')))));
    this.usarDecimales = sucursal.usar_decimales;
    this.imprimir_ticket = sucursal.imprimir_ticket;
    this.formato_ticket = sucursal.formato_ticket;

    this.ticketService.getTicketInfo(this.idFac, 3).subscribe(
      (resp) => {
        //console.log(resp);
        this.propina = resp.data.facturaVenta.propina;

        this.total_bolsa = resp.data.total_bolsa ?? 0;

        this.domicilio = resp.data.domicilio ? +resp.data.domicilio.valor : 0;

        this.total =
          resp.data.facturaVenta?.total_with_tip +
          this.domicilio +
          this.total_bolsa;

        this.mesaAtendida = resp.data.facturaVenta.mesa_id;
        this.factura = resp.data.facturaVenta;
        this.combinados = resp.data.combinados;
        this.codigo = resp.data.facturaVenta.cod_factura;

        this.precio = resp.data.facturaVenta.total;

        this.mesa = this.factura?.mesa_id;

        this.data = resp.data;
        this.idInvoice = resp.data.facturaVenta.id;

        this.showInformationInvoice = this.factura.metodo_pago_id
          ? true
          : false;

        this.isPaidInvoice = this.factura.estado_id != 2;

        if (this.factura.estado_id == 2) {
          // Factura en proceso
          if (this.imprimir_ticket) {
            this.imprimirComanda();
          }
        } else {
          // La factura se completó
          if (this.imprimir_ticket) {
            if (this.formato_ticket == false) {
              this.imprimirTicket();
            } else {
              this.imprimirTicketCarta();
            }
          }
        }
      },
      (error) => {
        //console.log(error);
      }
    );
  }

  returnZones() {
    if (document.location.href.indexOf('ventarestaurantebar') != -1) {
      this.router.navigate(['/vender/ventarestaurantebar']);
    } else {
      this.router.navigate(['/vender/ventatienda']);
    }
  }

  imprimirTicket() {
    this.showTicket = true;
    this.canShowTotals = true;
    this.type = 1;
  }

  imprimirTicketCarta() {
    this.showTicketCarta = true;
    this.canShowTotals = true;
    this.type = 1;
  }

  imprimirComanda() {
    this.showTicket = true;
    this.canShowTotals = false;
    this.type = 3;
  }

  closeTicket(value: string) {
    this.showTicket = false;
  }

  closeTicketCarta(value: string) {
    this.showTicketCarta = false;
  }

  public proccessEditEvent(id: string) {
    this.isPaymentVisible = false;
  }

  public reloadEditEvent(id: string) {
    this.isPaymentVisible = false;
    this.ngOnInit();
  }

  idFactura = null;

  openModalPayment(id, idFactura, precio) {
    this.idFactura = idFactura;
    this.isPaymentVisible = true;
  }

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
