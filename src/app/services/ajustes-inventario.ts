import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AjusteInventarioService {

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
   * Obtener las Gasto
   * 
   * @returns Observable<any>
   */
  getAjusteInventarioPorPagina(page, fecha_inicial,fecha_final, search, perPage, paginate, bodega) {
    return this.http.get<any>(`${this._urlApi}/ajusteInventario?page=${page}&fecha_inicial=${fecha_inicial}&fecha_final=${fecha_final}&search=${search}&size=${perPage}&paginate=${paginate}&bodega=${bodega}`, this.headers);
  }


  addAjusteInventario(body: any) { 
    return this.http.post<any>(`${this._urlApi}/ajusteInventario`, body, this.headers);
  }

  putAjusteInventario(body: any, id: number) {
    return this.http.put<any>(`${this._urlApi}/ajusteInventario/${id}`, body, this.headers);
  }

  deleteAjusteInventario(id: number) {
    return this.http.delete<any>(`${this._urlApi}/ajusteInventario/${id}`, this.headers);
  }

  /* Para cargar el archivo y hacer el ajuste de inventario masivo */
  importarArchivo(data) {
    const token = localStorage.getItem(btoa('token')) || '';
    let headers = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });
    return this.http.post<any>(`${this._urlApi}/importarAjusteInventarioMasivo`, data, {
      headers: headers,
    });
  }

  /* Para traer la data de losproductos y generar formato para hacer ajustes masivos */
  getDataProductosAjustesMasivos(bodega) {
    return this.http.get<any>(
      `${this._urlApi}/dataFormatoAjusteInventario?bodega=${bodega}`,
      this.headers
    );
  }

}
