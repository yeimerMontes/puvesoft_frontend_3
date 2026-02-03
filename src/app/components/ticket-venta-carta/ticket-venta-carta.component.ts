import { ModalDirective } from 'ngx-bootstrap/modal';
import { DOCUMENT, DatePipe } from '@angular/common';
import { SucursalService } from 'src/app/services/sucursal.service';
import {
  Component,
  OnInit,
  Input,
  HostListener,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  Inject,
} from '@angular/core';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { PrintServiceService } from 'src/app/services/print-service.service';
import { TicketService } from 'src/app/services/ticket.service';
import { metodoPagos } from 'src/app/constants/selects';
import { environment } from 'src/environments/environment';
import { MonedaService } from 'src/app/services/moneda.service';

@Component({
  selector: 'app-ticket_venta_carta',
  templateUrl: './ticket-venta-carta.component.html',
  styleUrls: ['./ticket-venta-carta.component.css'],
})
export class TicketVentaCartaComponent implements OnInit {
  @Input() id: number;
  @Input() type: number;
  @Input() showPaid: boolean = false;
  @Output() editEvent = new EventEmitter<string>();

  @Input() isOpenAlways: boolean = false;

  @Input() canShowTotals: boolean = true;

  @ViewChild('staticModalPagar', { static: false })
  childModalPagar?: ModalDirective;

  factura: any;
  products = [];
  sucursal: any;
  ticket: any;

  totalProductos = 0;

  metodosPago = metodoPagos;

  metodoPagoSelected = null;

  date: any;

  usarDecimales: Number = 1;
  moneda: string = '$';

  combinados = [];

  titleTicket = '';

  anchoTicket = 370;
  sizeLetraTicket = 12;

  total = 0;

  @ViewChild('print_ticket', { static: false }) print_ticket: ElementRef;

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(
    evt: KeyboardEvent,
  ) {
    this.editEvent.emit('');
  }

  nameSite = '';

  constructor(
    private sucursalService: SucursalService,
    private datePipe: DatePipe,
    private ticketService: TicketService,
    private funcionesService: FuncionesService,
    private printServiceService: PrintServiceService,
    private monedaService: MonedaService,
    @Inject(DOCUMENT) document: any,
  ) {
    let hostname = document.location.hostname;

    let environmentConfig = environment[hostname];
    this.nameSite = environmentConfig.nameSite;
  }

  openModalPagar(obj: {} = {}) {
    this.childModalPagar?.show();

    setTimeout(() => {
      this.imprimir();
    }, 150);
  }
  ngOnInit(): void {
    this.ticketService.getTicketInfo(this.id, this.type).subscribe(
      (resp) => {
        this.ticket = resp.data;

        this.ticket.facturaVenta.resolucion = JSON.parse(
          this.ticket.facturaVenta.resolucion,
        );

        if (this.ticket?.facturaVenta?.metodo_pago_id) {
          this.metodoPagoSelected = this.metodosPago.find(
            (element) =>
              element.id == this.ticket?.facturaVenta?.metodo_pago_id,
          );
        }

        for (let i = 0; i < this.ticket?.facturaVentaDetalle.length; i++) {
          const element = this.ticket?.facturaVentaDetalle[i];
          this.totalProductos += element.cantidad * 1;
        }

        let domicilio = resp.data.domicilio ? +resp.data.domicilio.valor : 0;

        this.total = this.ticket?.facturaVenta?.total_with_tip + domicilio;
        this.combinados = resp.data.combinados;
        this.openModalPagar({});
      },
      (error) => {
        //console.log(error);
      },
    );

    switch (this.type) {
      case 1:
        this.titleTicket = 'Factura';
        break;

      case 2:
        this.titleTicket = 'Devolución';
        break;

      case 3:
        this.titleTicket = 'Comanda';
        break;

      default:
        break;
    }

    this.sucursal = JSON.parse(
      decodeURIComponent(atob(localStorage.getItem(btoa('sucursal')))),
    );

    if (!this.sucursal) {
      this.sucursalService.getSucursal().subscribe((resp) => {
        this.sucursal = resp.data;
        this.usarDecimales = this.sucursal.usar_decimales;
        this.moneda = this.monedaService.obtenerSimbolo(this.sucursal.moneda);
        this.anchoTicket = this.sucursal.tamano_papel;
        this.sizeLetraTicket = this.sucursal.tamano_letra;
        localStorage.setItem(
          btoa('sucursal'),
          btoa(encodeURIComponent(JSON.stringify(this.sucursal))),
        );
      });
    } else {
      this.usarDecimales = this.sucursal.usar_decimales;
      this.moneda = this.monedaService.obtenerSimbolo(this.sucursal.moneda);
      this.anchoTicket = this.sucursal.tamano_papel;
      this.sizeLetraTicket = this.sucursal.tamano_letra;
    }
    this.date = this.datePipe.transform(new Date(), 'y/MM/d h:mm:ss a');
  }

  closeModalPagar() {
    this.childModalPagar?.hide();
    this.editEvent.emit('');
  }

  imprimir() {
    let printContents = this.print_ticket.nativeElement.innerHTML;

    setTimeout(() => {
      this.printServiceService.printDiv('print_ticket', printContents, true);
      this.printServiceService.isPrinting.subscribe((isPrinting: boolean) => {
        if (!isPrinting) {
          if (!this.isOpenAlways) {
            this.editEvent.emit('');
          }
        }
      });
    }, 300);
  }

  formatearNumber(valor) {
    return this.funcionesService.getFormatearNumero(valor, this.usarDecimales);
  }

  chooseFormateo(valor) {
    if (Number.isInteger(+valor)) {
      return this.formatearNumberConDecimal(+valor);
    } else {
      return this.formatearNumberSinDecimal(+valor);
    }
  }

  formatearNumberSinDecimal(valor) {
    return this.funcionesService.getFormatearNumero(valor, 2);
  }

  formatearNumberConDecimal(valor) {
    return this.funcionesService.getFormatearNumero(valor, 1);
  }

  toJson(data) {
    return JSON.parse(data);
  }

  pagoCombinado(metodoPago) {
    if (this.combinados.length > 0) {
      let found = this.combinados.find(
        (item) => item.metodo_pago_id == metodoPago,
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
}
