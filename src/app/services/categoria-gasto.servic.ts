import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CategoriaGastoService {

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
   * Obtener las CategoriaGasto
   * 
   * @returns Observable<any>
   */
  getCategoriaGastoPorPagina(page, search, perPage, paginate) {
    return this.http.get<any>(`${this._urlApi}/categoriaGastos?page=${page}&search=${search}&size=${perPage}&paginate=${paginate}`, this.headers);
  }

  


  addCategoriaGasto(body: any) { 
    return this.http.post<any>(`${this._urlApi}/categoriaGastos`, body, this.headers);
  }

  putCategoriaGasto(body: any, id: number) {
    return this.http.put<any>(`${this._urlApi}/categoriaGastos/${id}`, body, this.headers);
  }

  deleteCategoriaGasto(id: number) {
    return this.http.delete<any>(`${this._urlApi}/categoriaGastos/${id}`, this.headers);
  }


  getCategoriasAtivas() {
    return this.http.get<any>(`${this._urlApi}/categoriaGastosAtivas`, this.headers);
  }

}
