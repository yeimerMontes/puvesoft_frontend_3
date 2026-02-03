import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class InsumoProduccionDetalleService {
  private _urlApi = environment.baseUrl;
  private _excel = environment.userExcel;

  constructor(private http: HttpClient, @Inject(DOCUMENT) document: any) {
    let hostname = document.location.hostname;

    let environmentConfig = environment[hostname];

    this._urlApi = environmentConfig.backendUrl;
  }

  get headers() {
    return HeadersParam.getHeaders();
  }

  addInsumo(body: any) {
    return this.http.post<any>(
      `${this._urlApi}/insumosProduccion`,
      body,
      this.headers
    );
  }

  deleteInsumo(produccion_id: number, insumo_id: number) {
    return this.http.get<any>(
      `${this._urlApi}/insumoDeleteProduccion?produccion_id=${produccion_id}&insumo_id=${insumo_id}`,
      this.headers
    );
  }

  /* Consulto los insumos pertenecientes a un combo */
  getInsumoCombo(produccion_id) {
    return this.http.get<any>(
      `${this._urlApi}/insumosComboProduccion?produccion_id=${produccion_id}`,
      this.headers
    );
  }
}
