import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HeadersParam } from '../helpers/header-token';
import { environment } from 'src/environments/environment';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class BancosService {

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
    perPage
  ) {

    return this.http.get<any>(
      `${this._urlApi}/categoria-ventas?fecha_inicial=${fecha_inicial}&hora_inicial=${hora_inicial}&fecha_final=${fecha_final}&hora_final=${hora_final}&categoria=${categoria}&size=${perPage}&page=${page}&typeReport=${typeReport}`,
      this.headers
    );
  }

  getBancos() {
    return this.http.get<any>(
      `${this._urlApi}/bancos`,
      this.headers
    );
  }

  getTipoMovimientoBancos() {
    return this.http.get<any>(
      `${this._urlApi}/tipos-movimientos-bancos`,
      this.headers
    );
  }

  getBancosSeguimientos(
    page,
    fecha_inicial,
    fecha_final,
    hora_inicial,
    hora_final,
    metodo_pago,
    tipo_movimiento,
    perPage,
    typeReport
  ) {
    return this.http.get<any>(
      `${this._urlApi}/bancos-detalles?fecha_inicial=${fecha_inicial}&hora_inicial=${hora_inicial}&fecha_final=${fecha_final}&hora_final=${hora_final}&metodo_pago=${metodo_pago}&tipo_movimiento=${tipo_movimiento}&size=${perPage}&page=${page}&typeReport=${typeReport}`,
      this.headers
    );
  }

  getBancosTraslados(
    page,
    fecha_inicial,
    fecha_final,
    hora_inicial,
    hora_final,
    metodo_pago,
    user,
    perPage,
    typeReport
  ) {
    return this.http.get<any>(
      `${this._urlApi}/bancos-traslado?fecha_inicial=${fecha_inicial}&hora_inicial=${hora_inicial}&fecha_final=${fecha_final}&hora_final=${hora_final}&metodo_pago=${metodo_pago}&user=${user}&size=${perPage}&page=${page}&typeReport=${typeReport}`,
      this.headers
    );
  }

  
  addAjusteBanco(body: any) {
    return this.http.post<any>(`${this._urlApi}/nuevoAjusteBanco`, body, this.headers);
  }

  addTrasladoBanco(body: any) {
    return this.http.post<any>(`${this._urlApi}/bancos-traslado`, body, this.headers);
  }

}
