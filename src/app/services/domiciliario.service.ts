import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class DomiciliarioService {

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
   * Obtener el operador
   * 
   * @returns Observable<any>
   */
  getDomiciliariosPorPagina(page, search, perPage, paginate) {
    return this.http.get<any>(`${this._urlApi}/domiciliarios?page=${page}&search=${search}&size=${perPage}&paginate=${paginate}`, this.headers);
  }

  getDomiciliariosExcel() {
    //console.log(search);
    const token = localStorage.getItem(btoa('token'));
    window.open(`${this._excel}?token=${token}`, "_blank");
    // return this.http.get<any>(`${this._excel}`).subscribe(resp => {});
  }

  addDomiciliario(body: any) {
    return this.http.post<any>(`${this._urlApi}/domiciliarios`, body, this.headers);
  }

  putDomicilario(body: any, id: number) {
    //console.log(body)
    return this.http.put<any>(`${this._urlApi}/domiciliarios/${id}`, body, this.headers);
  }

  deleteDomiciliario(id: number) {
    return this.http.delete(`${this._urlApi}/domiciliarios/${id}`, this.headers);
  }

}
