import { Inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ImpuestosService {
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

  getImpuestosPorPagina(
    type,
    page,
    fecha_inicial,
    fecha_final,
    hora_inicial,
    hora_final,
    usuario,
    perPage,
    typeReport,
    tipo_factura_venta,
    codigo?,
  ) {
    return this.http.get<any>(
      `${this._urlApi}/impuestosProductos?size=${perPage}&page=${page}&type=${type}&fecha_inicial=${fecha_inicial}&hora_inicial=${hora_inicial}&fecha_final=${fecha_final}&hora_final=${hora_final}&usuario=${usuario}&search=${codigo}&typeReport=${typeReport}&tipo_factura_venta=${tipo_factura_venta}`,  
      this.headers
    );
  }
}
