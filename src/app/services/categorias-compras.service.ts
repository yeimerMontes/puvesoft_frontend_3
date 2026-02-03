import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HeadersParam } from '../helpers/header-token';
import { environment } from 'src/environments/environment';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CategoriasComprasService {

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

  
  getCategoriasDeComprasPorPagina(
    page,
    fecha_inicial,
    fecha_final,
    hora_inicial,
    hora_final,
    categoria,
    typeReport,
    perPage
  ) {

    return this.http.get<any>(
      `${this._urlApi}/categoria-compras?fecha_inicial=${fecha_inicial}&hora_inicial=${hora_inicial}&fecha_final=${fecha_final}&hora_final=${hora_final}&categoria=${categoria}&size=${perPage}&page=${page}&typeReport=${typeReport}`,
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
