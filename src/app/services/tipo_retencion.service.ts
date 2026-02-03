import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TipoRetencionService {

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
  getTipoRetencionPorPagina(page, search, perPage, paginate) {
    return this.http.get<any>(`${this._urlApi}/tipo_retencion?page=${page}&search=${search}&size=${perPage}&paginate=${paginate}`, this.headers);
  }

  addTipoRetencion(body: any) { 
    return this.http.post<any>(`${this._urlApi}/tipo_retencion`, body, this.headers);
  }

  putTipoRetencion(body: any, id: number) {
    return this.http.put<any>(`${this._urlApi}/tipo_retencion/${id}`, body, this.headers);
  }

  deleteTipoRetencion(id: number) {
    return this.http.delete(`${this._urlApi}/tipo_retencion/${id}`, this.headers);
  }

  getTipoRetencionAll() {
    return this.http.get<any>(`${this._urlApi}/tipo_retencion/listar`, this.headers);
  }

}
