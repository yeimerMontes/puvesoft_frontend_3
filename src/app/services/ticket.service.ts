import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TicketService {

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

  getTicketInfo(id: number, type: number) {
    if (type == 3) {
      return this.http.get<any>(`${this._urlApi}/${id}/ticket?show_returns=1`, this.headers);
    } else {
      return this.http.get<any>(`${this._urlApi}/${id}/ticket-factura?show_returns=1`, this.headers);
    }
  }

  getTicketInfoCompra(id: number) {
    return this.http.get<any>(`${this._urlApi}/compras/${id}/ticket`, this.headers);
  }

  getTicketInfoCotizacion(id: number) {
    return this.http.get<any>(`${this._urlApi}/cotizar/${id}/ticket`, this.headers);
  }

  getTicketInfoCaja(id: number) {
    return this.http.get<any>(`${this._urlApi}/ticketCierreCaja?cierre_caja_id=${id}`, this.headers);
  }

  getTicketInfoDevoluciones(id: number) {
    return this.http.get<any>(`${this._urlApi}/ticketDevoluciones?devolucion_id=${id}`, this.headers);
  }

  getTicketInfoDevolucionesCompras(id: number) {
    return this.http.get<any>(`${this._urlApi}/ticketDevolucionesCompras?devolucion_id=${id}`, this.headers);
  }

  getTicketInfoAbonos(id: number) {
    return this.http.get<any>(`${this._urlApi}/abonos/${id}/ticket`, this.headers);
  }

  getTicketInfoComprasAbonos(id: number) {
    return this.http.get<any>(`${this._urlApi}/abonos-compras/${id}/ticket`, this.headers);
  }
  
}
