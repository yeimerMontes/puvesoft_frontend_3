import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class EstadoVentaService {
  private _urlApi = environment.baseUrl;
  //private _excel = environment.userExcel;

  constructor(private http: HttpClient,
    @Inject(DOCUMENT) document: any
    ) {    
    let hostname = document.location.hostname;

    let environmentConfig = environment[hostname];
    
    this._urlApi = environmentConfig.backendUrl;
  }

  get headers() {
    return HeadersParam.getHeaders();
  }

  /**
   * Obtener las Gasto
   *
   * @returns Observable<any>
   */
  getHistorialVentaPorPagina(
    page,
    fecha_inicial,
    fecha_final,
    hora_inicial,
    hora_final,
    usuario,
    metodo_pago,
    tipo_factura,
    tipo_factura_venta,
    perPage,
    search,
    tipo_venta,
    estado,
    typeReport,
    tipo_atencion
  ) {
   // console.log(tipo_venta);
    
    return this.http.get<any>(

      `${this._urlApi}/estadoVenta?size=${perPage}&page=${page}&fecha_inicial=${fecha_inicial}&hora_inicial=${hora_inicial}&fecha_final=${fecha_final}&hora_final=${hora_final}&usuario=${usuario}&metodo_pago=${metodo_pago}&tipo_factura=${tipo_factura}&tipo_factura_venta=${tipo_factura_venta}&search=${search}&tipo_venta=${tipo_venta}&estado=${estado}&typeReport=${typeReport}&tipo_atencion=${tipo_atencion}`,
      this.headers
    );
  }

  /* Consulto ventas por metodo de pago */
  getVentasPorMetodoPago(
    fecha_inicial,
    fecha_final,
    hora_inicial,
    hora_final,
    usuario,
    metodo_pago,
    tipo_factura,
    tipo_factura_venta,
    search,
    tipo_venta,
    estado,
    tipo_atencion
  ) {
    
    return this.http.get<any>(
      `${this._urlApi}/ventasPorMetodoPago?fecha_inicial=${fecha_inicial}&fecha_final=${fecha_final}&hora_inicial=${hora_inicial}&hora_final=${hora_final}&metodo_pago=${metodo_pago}&tipo_factura=${tipo_factura}&tipo_factura_venta=${tipo_factura_venta}&search=${search}&tipo_venta=${tipo_venta}&usuario=${usuario}&estado=${estado}&tipo_atencion=${tipo_atencion}`,
      this.headers
    );
  }

  /* Consulto ventas por metodo de pago */
  getVentasPorMesas(
    fecha_inicial,
    fecha_final,
    hora_inicial,
    hora_final,
    usuario,
    metodo_pago,
    tipo_factura,
    search,
    tipo_venta,
    estado,
    show_courtesy,
    tipo_atencion
  ) {
    return this.http.get<any>(
      `${this._urlApi}/ventasPorMesa?fecha_inicial=${fecha_inicial}&fecha_final=${fecha_final}&hora_inicial=${hora_inicial}&hora_final=${hora_final}&usuario=${usuario}&metodo_pago=${metodo_pago}&tipo_factura=${tipo_factura}&search=${search}&tipo_venta=${tipo_venta}&show_courtesy=${show_courtesy}&estado=${estado}&tipo_atencion=${tipo_atencion}`,
      this.headers
    );
  }
}
