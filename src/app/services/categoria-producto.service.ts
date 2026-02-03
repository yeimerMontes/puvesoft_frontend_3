import { environment } from './../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CategoriaProductoService {

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
   * Obtener las CategoriaProducto
   * 
   * @returns Observable<any>
   */
  getCategoriaProductoPorPagina(page, search, perPage, paginate) {
    return this.http.get<any>(`${this._urlApi}/categoriaProductos?page=${page}&search=${search}&size=${perPage}&paginate=${paginate}`, this.headers);
  }

  //consulto las categorias por sucursal
  getcategoriaProductoPorSucursal(sucursal) {
    return this.http.get<any>(`${this._urlApi}/categoriaProductoPorSucursal?sucursal=${sucursal}`, this.headers);
  }

  getCategoriaProductoExcel() {
    //console.log(search);
    const token = localStorage.getItem(btoa('token'));
    window.open(`${this._excel}?token=${token}`, "_blank");
    // return this.http.get<any>(`${this._excel}`).subscribe(resp => {});
  }

  addCategoriaProducto(body: any) {
    return this.http.post<any>(`${this._urlApi}/categoriaProductos`, body, this.headers);
  }

  putCategoriaProducto(body: any, id: number) {
    return this.http.put<any>(`${this._urlApi}/categoriaProductos/${id}`, body, this.headers);
  }

  deleteCategoriaProducto(id: number) {
    return this.http.delete<any>(`${this._urlApi}/categoriaProductos/${id}`, this.headers);
  }


  getCategoriasAtivas() {
    return this.http.get<any>(`${this._urlApi}/categoriaProductosAtivas`, this.headers);
  }

  importarArchivo(data) {
    const token = localStorage.getItem(btoa('token')) || '';
    //const headers = new HttpHeaders().set('Authorization', "Bearer " + token || '')
    let headers = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });
    return this.http.post<any>(`${this._urlApi}/importarCategoriaProductos`, data, {
      headers: headers,
    });
  }

}
