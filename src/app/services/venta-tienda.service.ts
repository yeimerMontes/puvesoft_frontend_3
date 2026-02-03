import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { HeadersParam } from '../helpers/header-token';
import { environment } from 'src/environments/environment';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class VentaTiendaService {
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

  postPayment(type, body) {
    body['type'] = type;

    console.log(body);
    
    return this.http.post<any>(
      `${this._urlApi}/venta-tienda/pagar`,
      body,
      this.headers
    );
  }

  postEspera(body, carritoId: null) {
    let prds = {
      'carrito_venta': carritoId,
      'prds': body
    }
    return this.http.post<any>(
      `${this._urlApi}/carritoVentas`,
      prds,
      this.headers
    );
  }

  indexCarrito() {
    return this.http.get<any>(
      `${this._urlApi}/carritoVentas`,
      this.headers
    );
  }

  showCarritoDetalle(idCarrito) {
    return this.http.get<any>(
      `${this._urlApi}/detalleCarritoVenta?carrito_venta=${idCarrito}`,
      this.headers
    );
  }

  deleteCarrito(carritoId) {
    return this.http.delete<any>(
      `${this._urlApi}/carritoVentas/${carritoId}`,
      this.headers
    );
  }

  changeAlias(carritoId, alias) {
    return this.http.get<any>(
      `${this._urlApi}/changeAlias/${carritoId}?alias=${alias}`,
      this.headers
    );
  }

  saveNotaCarrito(carritoId, nota) {
    return this.http.get<any>(
      `${this._urlApi}/saveNote/${carritoId}?nota=${nota}`,
      this.headers
    );
  }
}
