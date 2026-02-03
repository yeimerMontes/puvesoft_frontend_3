import { environment } from './../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class BodegaService {

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
   * Obtener las Bodega
   * 
   * @returns Observable<any>
   */
  getBodegaPorPagina(page, search, perPage, paginate, user, producto) {
    return this.http.get<any>(`${this._urlApi}/bodegas?page=${page}&search=${search}&size=${perPage}&paginate=${paginate}&user=${user}&producto=${producto}`, this.headers);
  }

   ///consultos las bodegas que hacen parte de una sucursal
   getbodegasSucursales($sucursal) {
    return this.http.get<any>(`${this._urlApi}/bodegasPorSucursal?sucursal=${$sucursal}`, this.headers);
  }

  getBodegaPermisos(producto) {
    return this.http.get<any>(`${this._urlApi}/bodegaUsuario?producto=${producto}`, this.headers);
  }

  getBodegaExcel() {
    //console.log(search);
    const token = localStorage.getItem(btoa('token'));
    window.open(`${this._excel}?token=${token}`, "_blank");
    // return this.http.get<any>(`${this._excel}`).subscribe(resp => {});
  }

  addBodega(body: any) {
    return this.http.post<any>(`${this._urlApi}/bodegas`, body, this.headers);
  }

  putBodega(body: any, id: number) {
    return this.http.put<any>(`${this._urlApi}/bodegas/${id}`, body, this.headers);
  }

  deleteBodega(id: number) {
    return this.http.delete<any>(`${this._urlApi}/bodegas/${id}`, this.headers);
  }

  addBodegaPermiso(body: any) {
    return this.http.post<any>(`${this._urlApi}/AddBodegaPermiso`, body, this.headers);
  }

}
