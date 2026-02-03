import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AdicionesService {
  private _urlApi = environment.baseUrl;
  private _excel = environment.userExcel;

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

 
  addAdicion(body: any) {
     if (body.valor_venta != '') {
      body.valor_venta = body.valor_venta.replaceAll(',', '');
    }

    return this.http.post<any>(`${this._urlApi}/adiciones`, body, this.headers);
  }

  adicionesDelete(producto_id: number, insumo_id: number) {
    return this.http.get<any>(
      `${this._urlApi}/adicionesDelete?producto_id=${producto_id}&insumo_id=${insumo_id}`,
      this.headers
    );

  }

  /* Consulto los insumos pertenecientes a un combo */
  getAdiciones(producto_id) {
    return this.http.get<any>(
      `${this._urlApi}/getAdiciones?producto_id=${producto_id}`,
      this.headers
    );
  }

}
