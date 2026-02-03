import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class DomicilioService {

  private _urlApi = environment.baseUrl;
  //private _excel = environment.userExcel;

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
  getDomiciliosPorPagina(page, search, perPage, paginate, type, fecha_inicial, fecha_final) {
    return this.http.get<any>(`${this._urlApi}/domicilios?page=${page}&search=${search}&size=${perPage}&paginate=${paginate}&type=${type}&fecha_inicial=${fecha_inicial}&fecha_final=${fecha_final}`, this.headers);
  }


  putDomicilio(body: any, id: number) {
    return this.http.put<any>(`${this._urlApi}/domicilios/${id}`, body, this.headers);
  }
  
}
