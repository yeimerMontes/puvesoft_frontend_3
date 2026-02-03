import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class NotaFacturaElectronicaService {

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

  getEstadoFacturaElectronica(id: number, type: number) {

    return this.http.get<any>(`${this._urlApi}/${id}/estadoFacturaElectronica?show_returns=1&tipo_nota=${type}`, this.headers);

  }

  ///consulto estado de documentos soportes
  getEstadoDocumentosSoportesElectronica(id: number, type: number) {

    return this.http.get<any>(`${this._urlApi}/${id}/estadoFacturaDocumentoSoporteElectronica?show_returns=1`, this.headers);

  }

}
