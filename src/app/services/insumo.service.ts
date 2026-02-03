import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class InsumoService {
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
   * Obtener las zonas
   *
   * @returns Observable<any>
   */
  getInsumosActivosPorPagina(page, search, perPage, paginate) {
    return this.http.get<any>(
      `${this._urlApi}/insumosActivos?page=${page}&search=${search}&size=${perPage}&paginate=${paginate}`,
      this.headers
    );
  }

  addInsumo(body: any) {
    return this.http.post<any>(`${this._urlApi}/insumos`, body, this.headers);
  }

  deleteInsumo(producto_id: number, insumo_id: number) {
    return this.http.get<any>(
      `${this._urlApi}/insumoDelete?producto_id=${producto_id}&insumo_id=${insumo_id}`,
      this.headers
    );

  }

  /* Consulto los insumos pertenecientes a un combo */
  getInsumoCombo(producto_id) {
    return this.http.get<any>(
      `${this._urlApi}/insumosCombo?producto_id=${producto_id}`,
      this.headers
    );
  }

}
