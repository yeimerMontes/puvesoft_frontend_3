import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class PromocionService {
  private _urlApi = environment.baseUrl;

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
   * Obtener los promociones
   *
   * @returns Observable<any>
   */
  getPromocionPorPagina(page, search, perPage, paginate, fecha_inicial, fecha_final) {
    return this.http.get<any>(
      `${this._urlApi}/promociones?page=${page}&search=${search}&size=${perPage}&paginate=${paginate}&fecha_inicial=${fecha_inicial}&fecha_final=${fecha_final}`,
      this.headers
    );
  }

  addPromocion(body: any) {
    return this.http.post<any>(
      `${this._urlApi}/promociones`,
      body,
      this.headers
    );
  }

  putPromocion(body: any, id: any) {
    return this.http.put<any>(
      `${this._urlApi}/promociones/${id}`,
      body,
      this.headers
    );
  }

  deletePromocion(id: number) {
    return this.http.delete<any>(
      `${this._urlApi}/promociones/${id}`,
      this.headers
    );
  }

  getPromocionId(id: any) {
    return this.http.get<any>(
      `${this._urlApi}/promocionId?promocion=${id}`,
      this.headers
    );
  }

  
  /* Consulto los productos de las categorias seleccionadas */
  getProductosPorcategoriaPromocion(data, page, search, perPage) {
    return this.http.get<any>(
      `${this._urlApi}/productosCategoriaPromocion?page=${page}&search=${search}&size=${perPage}&idPromocion=${data.idPromocion}`,
      this.headers
    );
  }

  addProductoPromocion(body: any) { 
    return this.http.post<any>(`${this._urlApi}/addProductoPromocion`, body, this.headers);
  }

  updatePrecioPromocion(body: any) { 
    return this.http.post<any>(`${this._urlApi}/updatePrecioPromocion`, body, this.headers);
  }
}
