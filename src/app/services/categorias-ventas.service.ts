import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HeadersParam } from '../helpers/header-token';
import { environment } from 'src/environments/environment';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CategoriasVentasService {

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

  
  getCategoriasDeVentasPorPagina(
    page,
    fecha_inicial,
    fecha_final,
    hora_inicial,
    hora_final,
    categoria,
    typeReport,
    perPage,
    option_report
  ) {

    return this.http.get<any>(
      `${this._urlApi}/categoria-ventas?fecha_inicial=${fecha_inicial}&hora_inicial=${hora_inicial}&fecha_final=${fecha_final}&hora_final=${hora_final}&categoria=${categoria}&size=${perPage}&page=${page}&typeReport=${typeReport}&option_report=${option_report}`,
      this.headers
    );
  }

  getCategoriasProductos() {
    return this.http.get<any>(
      `${this._urlApi}/categoriaProductosAtivas`,
      this.headers
    );
  }

}
