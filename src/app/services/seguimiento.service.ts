import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ProductoSeguimientoService {
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
   * Obtener el operador
   *
   * @returns Observable<any>
   */
  getproductoSeguimeintoPorPagina( page,
    fecha_inicial,
    fecha_final,
    hora_inicial,
    hora_final,
    producto,
    perPage) {
    
    return this.http.get<any>(
      `${this._urlApi}/productoSeguimiento?page=${page}&fecha_inicial=${fecha_inicial}&fecha_final=${fecha_final}&hora_inicial=${hora_inicial}&hora_final=${hora_final}&producto=${producto}&size=${perPage}`,
      this.headers
    );
  }


}
