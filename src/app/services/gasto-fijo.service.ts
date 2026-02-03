import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class GastoFijoService {
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

  /**
   * Obtener las Gasto
   *
   * @returns Observable<any>
   */
  getAllGastoFijo(
  ) {
    return this.http.get<any>(
      `${this._urlApi}/gastos-fijos`,
      this.headers
    );
  }

  addGasto(body: any) {
    body.valor = body.valor.replaceAll(',', '');
    return this.http.post<any>(`${this._urlApi}/gastos-fijos`, body, this.headers);
  }

  putGasto(body: any, id: number) {
    body.valor = body.valor.replaceAll(',', '');
    return this.http.put<any>(
      `${this._urlApi}/gastos-fijos/${id}`,
      body,
      this.headers
    );
  }

  deleteGasto(id: number) {
    return this.http.delete<any>(`${this._urlApi}/gastos-fijos/${id}`, this.headers);
  }

  getsAtivas() {
    return this.http.get<any>(`${this._urlApi}/GastosAtivas`, this.headers);
  }

  active(id) {
    return this.http.post<any>(`${this._urlApi}/gastos-fijos/${id}/active`, {}, this.headers);
  }

  inactive(id) {
    return this.http.post<any>(`${this._urlApi}/gastos-fijos/${id}/inactive`, {}, this.headers);
  }

  activeSacarCaja(id) {
    return this.http.post<any>(`${this._urlApi}/gastos-fijos/${id}/sacar`, {}, this.headers);
  }

  inactiveSacarCaja(id) {
    return this.http.post<any>(`${this._urlApi}/gastos-fijos/${id}/no-sacar`, {}, this.headers);
  }

  aplicarGastosFijos() {
    return this.http.post<any>(`${this._urlApi}/gastos-fijos/aplicar`, {}, this.headers);
  }
}
