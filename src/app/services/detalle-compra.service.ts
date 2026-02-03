import { Inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class DetalleComprasService {
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

  getDetalleCompraPorPagina(
    type,
    page,
    fecha_inicial,
    fecha_final,
    hora_inicial,
    hora_final,
    bodega,
    proveedor,
    usuario,
    perPage,
    typeReport,
    codigo,
  ) {
    return this.http.get<any>(
      `${this._urlApi}/detalleCompras?size=${perPage}&page=${page}&type=${type}&fecha_inicial=${fecha_inicial}&hora_inicial=${hora_inicial}&fecha_final=${fecha_final}&hora_final=${hora_final}&proveedor=${proveedor}&usuario=${usuario}&search=${codigo}&typeReport=${typeReport}&bodega=${bodega}`,
      this.headers
    );
  }
}
