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
import {
  metodoPagos,
  tipoNotaCreditoFacturaElectronica,
  tipoNotaDebitoFacturaElectronica,
} from 'src/app/constants/selects';
import { environment } from 'src/environments/environment';
import { HistorialVentaService } from 'src/app/services/historial-venta.servic';
import { MonedaService } from 'src/app/services/moneda.service';

@Component({
  selector: 'app-ticket-nota-credito',
  templateUrl: './ticket-nota-credito.component.html',
  styleUrls: ['./ticket-nota-credito.component.css'],
})
export class TicketNotaCreditoComponent implements OnInit {
  @Input() id: number;
  @Input() showPaid: boolean = false;
  @Output() editEvent = new EventEmitter<string>();

  @Input() isOpenAlways: boolean = false;

  @Input() canShowTotals: boolean = true;

  @Input() isNotaCredito: boolean = true;

  @ViewChild('staticModalPagar', { static: false })
  childModalPagar?: ModalDirective;

  factura: any;
  products = [];
  sucursal: any;
  // ticket: any;

  metodosPago = metodoPagos;

  // metodoPagoSelected = null;

  date: any;

  usarDecimales: Number = 1;
  moneda: string = '$';

  // combinados = [];

  titleTicket = 'Ticket Nota Crédito';

  anchoTicket = 370;
  sizeLetraTicket = 12;

  // total = 0;

  @ViewChild('print_ticket', { static: false }) print_ticket: ElementRef;

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(
    evt: KeyboardEvent,
  ) {
    this.editEvent.emit('');
  }

  website = '';
  nameSite = '';
  phone = '';

  dataDetalle = null;

  tipoNotaCreditoFacturaElectronica: any[] = [];

  constructor(
    private sucursalService: SucursalService,
    private datePipe: DatePipe,
    private funcionesService: FuncionesService,
    private printServiceService: PrintServiceService,
    @Inject(DOCUMENT) document: any,
    private historialVentaService: HistorialVentaService,
    private monedaService: MonedaService,
  ) {
    let hostname = document.location.hostname;

    let environmentConfig = environment[hostname];

    this.website = environmentConfig.website;
    this.nameSite = environmentConfig.nameSite;
    this.phone = environmentConfig.phone;
  }

  openModalPagar(obj: {} = {}) {
    this.childModalPagar?.show();

    setTimeout(() => {
      this.imprimir();
    }, 150);
  }
  ngOnInit(): void {
    this.tipoNotaCreditoFacturaElectronica = this.isNotaCredito
      ? tipoNotaCreditoFacturaElectronica
      : tipoNotaDebitoFacturaElectronica;

    this.titleTicket = this.isNotaCredito
      ? 'Ticket Nota Crédito'
      : 'Ticket Nota Débito';

    this.historialVentaService
      .getDetalleNotaCredito(this.id)
      .subscribe((resp) => {
        console.log(resp);
        this.dataDetalle = resp.data;

        this.openModalPagar({});
      });

    // this.ticketService.getTicketInfo(this.id, 1).subscribe(
    //   (resp) => {
    //     this.ticket = resp.data;

    //     if (this.ticket?.facturaVenta?.metodo_pago_id) {
    //       this.metodoPagoSelected = this.metodosPago.find(element => element.id == this.ticket?.facturaVenta?.metodo_pago_id)
    //     }

    //     let domicilio = (resp.data.domicilio) ? +resp.data.domicilio.valor : 0;

    //     this.total = this.ticket?.facturaVenta?.total_with_tip + domicilio;
    //     this.combinados = resp.data.combinados;
    //     this.openModalPagar({});
    //   },
    //   (error) => {
    //     //console.log(error);
    //   }
    // );

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
      this.printServiceService.printDiv('print_ticket', printContents);
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

  toJson(data) {
    return JSON.parse(data);
  }

  tipoConceptoById(id) {
    return this.tipoNotaCreditoFacturaElectronica.find(
      (element) => element.id == id,
    ).nombre;
  }
}
