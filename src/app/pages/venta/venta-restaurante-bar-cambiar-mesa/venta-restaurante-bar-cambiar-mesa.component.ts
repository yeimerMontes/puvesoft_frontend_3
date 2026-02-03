import { Router } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Component, OnInit, ViewChild, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { MesaService } from 'src/app/services/mesa.service';
import { FuncionService } from 'src/app/services/funcion.service';
import { ZonaService } from 'src/app/services/zona.service';

@Component({
  selector: 'app-venta-restaurante-bar-cambiar-mesa',
  templateUrl: './venta-restaurante-bar-cambiar-mesa.component.html',
  styleUrls: ['./venta-restaurante-bar-cambiar-mesa.component.scss'],
})
export class VentaRestauranteBarCambiarMesaComponent implements OnInit {
  @ViewChild('childModalChangeTable', { static: false })
  childModalChangeTable?: ModalDirective;
  @Input() mesa: number;
  @Output() editEvent = new EventEmitter<string>();


  zoneSelected = null;
  tablesArr = [];
  private _inputTableSelected = null;

  formNota: FormGroup;

  zoneData = [];

  constructor(
    private formBuilder: FormBuilder,
    private mesaService: MesaService,
    private funcionService: FuncionService,
    private zonaService: ZonaService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.formNota = this.formBuilder.group({
      mesa: ['', []],
      factura: ['', []],
    });

    setTimeout(() => {
      this.openModalChangeTable();
    }, 200);

    this.getZonas();

  }

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(
    evt: KeyboardEvent
  ) {
    this.edit('');
  }


  get inputTableSelected() {
    return this._inputTableSelected;
  }

  getMesasChangeTable(zona_id: number) {
    this.mesaService.getTableZoneOpen(zona_id).subscribe((resp) => {
      this.tablesArr = resp.data;
    });
  }

  public edit(value: string) {
    this.editEvent.emit(value);
  }

  openModalChangeTable() {
    this.zoneSelected = null;
    this._inputTableSelected = null;
    this.childModalChangeTable?.show();
  }

  closeModalChangeTable() {
    this.zoneSelected = null;
    this.childModalChangeTable?.hide();
    this.edit('');
  }

  chooseZoneToChange(id) {
    this.zoneSelected = id;
    this.tablesArr = [];
    this._inputTableSelected = null;
    this.getMesasChangeTable(this.zoneSelected);
  }

  changeTableId(id) {
    this._inputTableSelected = id;
  }

  reloadPage() {
    this.router.navigate(['/vender/ventarestaurantebar']);
  }

  confirmChangeTable() {
    this.mesaService
      .putChangeTable(this.mesa, this._inputTableSelected)
      .subscribe(
        (resp) => {
          this.funcionService.onSuccess(
            resp.message,
            'success',
            'Cambio de Mesa!'
          );
          this.reloadPage();
        },
        (error) => {
          this.funcionService.onSuccess(
            error.error.message,
            'error',
            'Cambio de Mesa!'
          );
        }
      );
  }

  /* Consulto el listado de zonas disponibles */
  getZonas() {
    this.zonaService.getZonaActivas().subscribe((resp) => {
      this.zoneData = resp.data;
    });
  }
}
