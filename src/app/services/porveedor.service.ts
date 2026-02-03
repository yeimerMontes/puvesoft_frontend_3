import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ProveedorService {

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
   * Obtener los proveedores
   * 
   * @returns Observable<any>
   */
  getProveedoresPorPagina(page, search, perPage, paginate) {
    return this.http.get<any>(`${this._urlApi}/proveedores?page=${page}&search=${search}&size=${perPage}&paginate=${paginate}`, this.headers);
  }

  search(search) {
    return this.http.get<any>(`${this._urlApi}/proveedores/search?search=${search}`, this.headers);
  }

  getUsersExcel() {
    //console.log(search);
    const token = localStorage.getItem(btoa('token'));
    window.open(`${this._excel}?token=${token}`, "_blank");
    // return this.http.get<any>(`${this._excel}`).subscribe(resp => {});
  }

  addProveedor(body: any) { 
    return this.http.post<any>(`${this._urlApi}/proveedores`, body, this.headers);
  }

  putProveedor(body: any, id: number) {
    return this.http.put<any>(`${this._urlApi}/proveedores/${id}`, body, this.headers);
  }

  deleteProveedor(id: number) {
    return this.http.delete(`${this._urlApi}/proveedores/${id}`, this.headers);
  }



}
