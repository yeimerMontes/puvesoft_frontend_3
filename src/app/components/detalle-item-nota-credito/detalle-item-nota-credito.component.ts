import { DatePipe, DOCUMENT } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { tipoNotaCreditoFacturaElectronica } from 'src/app/constants/selects';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { HistorialVentaService } from 'src/app/services/historial-venta.servic';
import { PrintServiceService } from 'src/app/services/print-service.service';
import { SucursalService } from 'src/app/services/sucursal.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-detalle-item-nota-credito',
  templateUrl: './detalle-item-nota-credito.component.html',
  styleUrls: ['./detalle-item-nota-credito.component.css']
})
export class DetalleItemNotaCreditoComponent implements OnInit {

  @Input() id: any;
  @Output() editEvent = new EventEmitter<string>();

  @Input() isOpenAlways: boolean = false;

  @ViewChild('staticModalDetalle', { static: false })
  staticModalDetalle?: ModalDirective;

  date: any;

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(
    evt: KeyboardEvent
  ) {
    this.editEvent.emit('');
  }

  dataDetalle = null;

  loadedDetalle = false;

  tipoNotaCreditoFacturaElectronica: any[] = tipoNotaCreditoFacturaElectronica;

  usarDecimales: Number = 1;

  sizeLetraTicket = 12;

  sucursal: any;

  website = '';
  nameSite = '';
  phone = '';

  @ViewChild('print_ticket', { static: false }) print_ticket: ElementRef;

  constructor(
    private sucursalService: SucursalService,
    private datePipe: DatePipe,
    private funcionesService: FuncionesService,
    private historialVentaService: HistorialVentaService,
    private printServiceService: PrintServiceService,
    @Inject(DOCUMENT) document: any
    ) {
      let hostname = document.location.hostname;
  
      let environmentConfig = environment[hostname];

      this.website = environmentConfig.website;
      this.nameSite = environmentConfig.nameSite;
      this.phone = environmentConfig.phone;
    }

  ngOnInit(): void {

    setTimeout(() => {
      this.openModalDetalle();
    }, 150);

    this.sucursal = JSON.parse(decodeURIComponent(atob(localStorage.getItem(btoa('sucursal')))));    
    
    if (!this.sucursal) {
      this.sucursalService.getSucursal().subscribe((resp) => {
        this.sucursal = resp.data;
        this.usarDecimales = this.sucursal.usar_decimales;
        localStorage.setItem(btoa('sucursal'), btoa(encodeURIComponent(JSON.stringify(this.sucursal))));
      });
    } else {
      this.usarDecimales = this.sucursal.usar_decimales;
    }

    this.date = this.datePipe.transform(new Date(), 'y/MM/d h:mm:ss a');
  }

  openModalDetalle() {
    this.staticModalDetalle?.show();

    setTimeout(() => {
      this.loadedDetalle = true;
    }, 1500);


    this.historialVentaService.getDetalleNotaCredito(this.id).subscribe(
      resp => {
        console.log(resp);
        this.dataDetalle = resp.data;
      }
    )

  }

  closeModalDetalle() {
    this.staticModalDetalle?.hide();
    this.loadedDetalle = false;
    this.editEvent.emit('');
  }

  tipoConceptoById(id) {
    return this.tipoNotaCreditoFacturaElectronica.find(element => element.id == id).nombre
  }

  formatearNumber(valor) {
    return this.funcionesService.getFormatearNumero(valor, this.usarDecimales);
  }

  imprimir() {    
    let printContents = this.print_ticket.nativeElement.innerHTML;

    console.log(printContents);

    setTimeout(() => {
      this.printServiceService.printDiv('print_ticket', printContents);
      this.printServiceService.isPrinting.subscribe((isPrinting: boolean) => {
        if (!isPrinting) {
          if (!this.isOpenAlways) {
            // this.editEvent.emit('');
          }
        }
      });
    }, 300);
  }

}
