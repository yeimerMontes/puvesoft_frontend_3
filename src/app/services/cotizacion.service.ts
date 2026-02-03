import { HeadersParam } from './../helpers/header-token';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CotizacionService {
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

  postPayment(body) {
    return this.http.post<any>(
      `${this._urlApi}/cotizar/pagar`,
      body,
      this.headers
    );
  }
}
