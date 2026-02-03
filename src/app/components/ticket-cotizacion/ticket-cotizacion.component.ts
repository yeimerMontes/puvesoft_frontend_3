import { DOCUMENT, DatePipe } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { MonedaService } from 'src/app/services/moneda.service';
import { PrintServiceService } from 'src/app/services/print-service.service';
import { SucursalService } from 'src/app/services/sucursal.service';
import { TicketService } from 'src/app/services/ticket.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-ticket-cotizacion',
  templateUrl: './ticket-cotizacion.component.html',
  styleUrls: ['./ticket-cotizacion.component.css'],
})
export class TicketCotizacionComponent implements OnInit {
  @Input() id: number;
  @Input() type: number;
  @Output() editEvent = new EventEmitter<string>();

  @Input() isOpenAlways: boolean = false;

  @Input() canShowTotals: boolean = true;

  @ViewChild('staticModalPagar', { static: false })
  childModalPagar?: ModalDirective;

  factura: any;
  products = [];
  sucursal: any;
  ticket: any;

  date: any;

  usarDecimales: Number = 1;
  moneda: string = '$';

  anchoTicket = 370;
  sizeLetraTicket = 12;

  @ViewChild('print_ticket', { static: false }) print_ticket: ElementRef;

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(
    evt: KeyboardEvent,
  ) {
    this.editEvent.emit('');
  }

  website = '';
  nameSite = '';
  phone = '';

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

    this.website = environmentConfig.website;
    this.nameSite = environmentConfig.nameSite;
    this.phone = environmentConfig.phone;
  }

  openModalPagar(obj: {} = {}) {
    this.childModalPagar?.show();

    setTimeout(() => {
      this.imprimir();
    }, 300);
  }
  ngOnInit(): void {
    console.log('ticket cotizacion');

    console.log(this.id);

    this.ticketService.getTicketInfoCotizacion(this.id).subscribe(
      (resp) => {
        console.log(resp);
        this.ticket = resp.data;
        console.log(this.ticket);
        this.openModalPagar({});
      },
      (error) => {
        console.log(error);
      },
    );

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
}
