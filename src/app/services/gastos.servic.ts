import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class GastoService {
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
  getGastoPorPagina(
    page,
    fecha_inicial,
    fecha_final,
    hora_inicial,
    hora_final,
    proveedor,
    metodo_pago,
    usuario,
    perPage,
    paginate
  ) {
    return this.http.get<any>(
      `${this._urlApi}/gastos?page=${page}&fecha_inicial=${fecha_inicial}&hora_inicial=${hora_inicial}&fecha_final=${fecha_final}&hora_final=${hora_final}&usuario=${usuario}&proveedor=${proveedor}&metodo_pago=${metodo_pago}&size=${perPage}&paginate=${paginate}`,
      this.headers
    );
  }

  getGastoPorCategoria(fecha_inicial, fecha_final, hora_inicial, hora_final, usuario, categoria) {
    return this.http.get<any>(
      `${this._urlApi}/gastosPorCategoria?categoria=${categoria}&fecha_inicial=${fecha_inicial}&hora_inicial=${hora_inicial}&fecha_final=${fecha_final}&hora_final=${hora_final}&usuario=${usuario}`,
      this.headers
    );
  }

  getGastoPorCategoriaExcel(fecha_inicial, fecha_final, hora_inicial, hora_final, usuario, categoria) {
    return this.http.get<any>(
      `${this._urlApi}/gastosPorCategoriaExcel?categoria=${categoria}&fecha_inicial=${fecha_inicial}&hora_inicial=${hora_inicial}&fecha_final=${fecha_final}&hora_final=${hora_final}&usuario=${usuario}`,
      this.headers
    );
  }

  addGasto(body: any) {
    body.valor = body.valor.replaceAll(',', '');
    return this.http.post<any>(`${this._urlApi}/gastos`, body, this.headers);
  }

  putGasto(body: any, id: number) {
    return this.http.put<any>(
      `${this._urlApi}/gastos/${id}`,
      body,
      this.headers
    );
  }

  deleteGasto(id: number) {
    return this.http.delete<any>(`${this._urlApi}/gastos/${id}`, this.headers);
  }

  getsAtivas() {
    return this.http.get<any>(`${this._urlApi}/GastosAtivas`, this.headers);
  }
}
