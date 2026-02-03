import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CierreCajaService {

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
  getProductosPorPagina(page, search, perPage, paginate) {
    return this.http.get<any>(`${this._urlApi}/productos?page=${page}&search=${search}&size=${perPage}&paginate=${paginate}`, this.headers);
  }

  getProductoExcel() {
    //console.log(search);
    const token = localStorage.getItem(btoa('token'));
    window.open(`${this._excel}?token=${token}`, "_blank");
    // return this.http.get<any>(`${this._excel}`).subscribe(resp => {});
  }

  addCierreCaja(body: any) { 
    return this.http.post<any>(`${this._urlApi}/cierreCaja`, body, this.headers);
  }

  addCierreCajaParaInformes(body: any) { 
    return this.http.post<any>(`${this._urlApi}/cerrarCaja`, body, this.headers);
  }

  putProducto(body: any, id: number) {
    return this.http.put<any>(`${this._urlApi}/productos/${id}`, body, this.headers);
  }

  deleteProducto(id: number) {
    return this.http.delete(`${this._urlApi}/productos/${id}`, this.headers);
  }

  getProductosActivos() {
    return this.http.get<any>(`${this._urlApi}/productosActivos`, this.headers);
  }

  getBusquedaPorNombreProductosActivos(producto:String) {
    return this.http.get<any>(`${this._urlApi}/busquedaPorNombreProductosActivas?search=${producto}`, this.headers);
  }

  estadoCaja() {
    return this.http.get<any>(`${this._urlApi}/estadoCaja`, this.headers);
  }

  
}
