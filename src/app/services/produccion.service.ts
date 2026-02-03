import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ProduccionService {
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

  /**
   * Obtener las zonas
   *
   * @returns Observable<any>
   */
  getProduccionPorPagina(page, search, perPage, paginate, typeProduct, store) {
    return this.http.get<any>(
      `${this._urlApi}/producciones?page=${page}&search=${search}&size=${perPage}&paginate=${paginate}&typeProduct=${typeProduct}&bodega=${store}`,
      this.headers
    );
  }

  getProduccionPorPaginaDetalle(
    page,
    search,
    perPage,
    paginate,
    typeProduct,
    store,
    fecha_inicial,
    fecha_final,
    estado
  ) {
    return this.http.get<any>(
      `${this._urlApi}/producciones?page=${page}&search=${search}&size=${perPage}&paginate=${paginate}&typeProduct=${typeProduct}&bodega=${store}&fecha_inicial=${fecha_inicial}&fecha_final=${fecha_final}&estado=${estado}`,
      this.headers
    );
  }

  geExcelProduccion(page, search, perPage, paginate, typeProduct, store) {
    return this.http.get<any>(
      `${this._urlApi}/geExcelProducto?page=${page}&search=${search}&size=${perPage}&paginate=${paginate}&typeProduct=${typeProduct}&bodega=${store}`,
      this.headers
    );
  }

  addProduccion(body: any) {
    if (body.cantidad_fabricar != '') {
      body.cantidad_fabricar = body.cantidad_fabricar.replaceAll(',', '');
    }
    return this.http.post<any>(
      `${this._urlApi}/producciones`,
      body,
      this.headers
    );
  }

  putProduccion(body: any, id: number) {
    if (body.cantidad_fabricar != '') {
      body.cantidad_fabricar = body.cantidad_fabricar.replaceAll(',', '');
    }
    return this.http.put<any>(
      `${this._urlApi}/producciones/${id}`,
      body,
      this.headers
    );
  }

  deleteProduccion(id: number) {
    return this.http.delete(`${this._urlApi}/producciones/${id}`, this.headers);
  }

  iniciarProduccion(produccion_id: number) {
    return this.http.put(
      `${this._urlApi}/iniciarProduccion/${produccion_id}`,
      {},
      this.headers
    );
  }

  anularProduccion(produccion_id: number) {
    return this.http.put(
      `${this._urlApi}/anularProduccion/${produccion_id}`,
      {},
      this.headers
    );
  }

  finalizarProduccion(produccion_id: number, cantidad) {
    return this.http.put(
      `${this._urlApi}/finalizarProduccion/${produccion_id}/${cantidad}`,
      {},
      this.headers
    );
  }
}
