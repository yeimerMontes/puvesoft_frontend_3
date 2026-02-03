import { PromocionService } from 'src/app/services/promocion.service';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { SucursalService } from 'src/app/services/sucursal.service';
import { Router } from '@angular/router';

@Component({
  selector: 'resumen-promocion',
  templateUrl: './resumen-promocion.component.html',
  styleUrls: ['../../../css/modulo.css', './resumen-promocion.component.css'],
})
export class ResumenPromocionComponent {
  @Output() paso = new EventEmitter<any>();
  @Input() idGestion: String;

  loaded = false;
  titleModule = 'Resumen la promoción';

  dataPromocion: any;
  usarDecimales: Number = 1;
  sucursal: any;
  precioProducto: number = 260777;
  por_descuento: number = 0;

  constructor(
    private promocionService: PromocionService,
    private funcionesService: FuncionesService,
    private sucursalService: SucursalService,
    private router: Router

  ) {}

  ngOnInit() {
    this.getSucural();
    this.getPromocionId();
  }

  public getPromocionId(): void {
    this.promocionService.getPromocionId(this.idGestion).subscribe((resp) => {
      this.loaded = true;

      this.dataPromocion = resp.data;
      this.precioProducto =
        this.precioProducto -
        this.precioProducto * (this.dataPromocion.por_descuento / 100);

        this.por_descuento = this.dataPromocion.por_descuento;
    });
  }

  /* Consulto informacion del sucursal */
  private getSucural(): void {
    try {
      this.sucursal = JSON.parse(decodeURIComponent(atob(localStorage.getItem(btoa('sucursal')))));
      this.usarDecimales = this.sucursal.usar_decimales;
    } catch (error) {
      this.sucursal = '';
    }
    if (!this.sucursal) {
      this.sucursalService.getSucursal().subscribe((resp) => {
        this.usarDecimales = resp.data.usar_decimales;
        //console.log(resp)
        localStorage.setItem(btoa('sucursal'), btoa(JSON.stringify(resp.data)));
      });
    }
  }

  atras() {
    this.paso.emit({
      idPromocion: this.idGestion,
      paso: 2,
      tipo_promocion: this.dataPromocion.tipo_promocion,
      categorias: this.dataPromocion.categorias,
      data: this.dataPromocion,
    });
  }

  finalizar(){
    this.router.navigate([`/promociones/listado`]);

  }
  formatearNumber(valor) {
    return this.funcionesService.getFormatearNumero(valor, this.usarDecimales);
  }
}
