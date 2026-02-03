import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ComisionesVentaService {
  private _urlApi = environment.baseUrl;

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
   * Obtener las ventas por comision
   *
   * @returns Observable<any>
   */
  getHistorialVentaPorPagina(
    page,
    fecha_inicial,
    fecha_final,
    hora_inicial,
    hora_final,
    empleado,
    metodo_pago,
    tipo_factura,
    tipo_factura_venta,
    perPage,
    search,
    tipo_venta,
    estado,
    typeReport,
  ) {
    
    return this.http.get<any>(

      `${this._urlApi}/comisionesVenta?size=${perPage}&page=${page}&fecha_inicial=${fecha_inicial}&hora_inicial=${hora_inicial}&fecha_final=${fecha_final}&hora_final=${hora_final}&empleado=${empleado}&metodo_pago=${metodo_pago}&tipo_factura=${tipo_factura}&tipo_factura_venta=${tipo_factura_venta}&search=${search}&tipo_venta=${tipo_venta}&estado=${estado}&typeReport=${typeReport}`,
      this.headers
    );
  }
}
