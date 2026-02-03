import { DOCUMENT } from '@angular/common';
import { HeadersParam } from './../helpers/header-token';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FacturaService {
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

  getPorcentajeFactura(id) {
    return this.http.get<any>(
      `${this._urlApi}/factura/${id}/porcentaje`,
      this.headers
    );
  }
}
