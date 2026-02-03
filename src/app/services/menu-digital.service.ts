import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class MenuDigitalService {

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
   * Obtener las Mesas
   * 
   * @returns Observable<any>
   */
  getMenuDigitalPorPagina(page, search, perPage, paginate) {
    return this.http.get<any>(`${this._urlApi}/menuDigital?page=${page}&search=${search}&size=${perPage}&paginate=${paginate}`, this.headers);
  }

  getMenuDigitalPorPaginaCategoria(page, search, categoria, perPage, paginate) {
    return this.http.get<any>(`${this._urlApi}/menuDigital?page=${page}&search=${search}&categoria=${categoria}&size=${perPage}&paginate=${paginate}`, this.headers);
  }


  addMenuDigital(body: any) { 
    return this.http.post<any>(`${this._urlApi}/menuDigital`, body, this.headers);
  }

  addMenuDigitalAll(body: any) { 
    return this.http.post<any>(`${this._urlApi}/menuDigitalAll`, body, this.headers);
  }

  putMenuDigital(body: any, id: number) {
    return this.http.put<any>(`${this._urlApi}/menuDigital/${id}`, body, this.headers);
  }

  deleteMenuDigital(id: number) {
    return this.http.delete(`${this._urlApi}/menuDigital/${id}`, this.headers);
  }

}
