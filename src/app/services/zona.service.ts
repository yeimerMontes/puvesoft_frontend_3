import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ZonaService {

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
  getZonasPorPagina(page, search, perPage, paginate) {
    return this.http.get<any>(`${this._urlApi}/zonas?page=${page}&search=${search}&size=${perPage}&paginate=${paginate}`, this.headers);
  }

  getUsersExcel() {
    //console.log(search);
    const token = localStorage.getItem(btoa('token'));
    window.open(`${this._excel}?token=${token}`, "_blank");
    // return this.http.get<any>(`${this._excel}`).subscribe(resp => {});
  }

  addZona(body: any) { 
    return this.http.post<any>(`${this._urlApi}/zonas`, body, this.headers);
  }

  putZona(body: any, id: number) {
    return this.http.put<any>(`${this._urlApi}/zonas/${id}`, body, this.headers);
  }

  deleteZona(id: number) {
    return this.http.delete(`${this._urlApi}/zonas/${id}`, this.headers);
  }

  getZonaActivas() {
    return this.http.get<any>(`${this._urlApi}/zonaActivas`, this.headers);
  }

}
