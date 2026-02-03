import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { HeadersParam } from '../helpers/header-token';
import { environment } from 'src/environments/environment';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class SucursalService {
  private _urlApi = environment.baseUrl; //url api

  get headers() {
    return HeadersParam.getHeaders();
  }

  constructor(private http: HttpClient,
    @Inject(DOCUMENT) document: any
    ) {    
    let hostname = document.location.hostname;

    let environmentConfig = environment[hostname];
    
    this._urlApi = environmentConfig.backendUrl;
  }

  /**
   * Obtener el operador
   *
   * @returns Observable<any>
   */
  getSucursal() {
    return this.http.get<any>(`${this._urlApi}/sucursales`, this.headers);
  }

  //consulto listado de sucursales
  getSucursalesActivas() {
    return this.http.get<any>(`${this._urlApi}/sucursalesActivas`, this.headers);
  }


  /* Consulto vencimeinto de sucursal */
  getVenSucursal() {
    return this.http.get<any>(`${this._urlApi}/venSucursal`, this.headers);
  }

  putSucursal(body: any) {
    return this.http.post<any>(
      `${this._urlApi}/sucursales`,
      body,
      this.headers
    );
  }
}
