import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TrasladoSucursalesService {

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
  getTrasladoSucursalesInventarioPorPagina(page, fecha_inicial, fecha_final, search, perPage, paginate, bodega) {
    return this.http.get<any>(`${this._urlApi}/TrasladoSucursales?page=${page}&fecha_inicial=${fecha_inicial}&fecha_final=${fecha_final}&search=${search}&size=${perPage}&paginate=${paginate}&bodega=${bodega}`, this.headers);
  }

  ///consultar existencia de un producto antes de ser trasladado
  getExistenciaProductoSucursalTraslado(producto, sucursal_destino) {
    return this.http.get<any>(`${this._urlApi}/existenciaProductoSucursalTraslado?producto=${producto}&sucursal_destino=${sucursal_destino}`, this.headers);
  }

  

  addTrasladoSucursales(body: any) {
    return this.http.post<any>(`${this._urlApi}/TrasladoSucursales`, body, this.headers);
  }


  
  putTrasladoSucursalesInventario(body: any, id: number) {
    return this.http.put<any>(`${this._urlApi}/TrasladoSucursales/${id}`, body, this.headers);
  }

  anularTrasladoSucursalesInventario(id: number) {
    return this.http.delete<any>(`${this._urlApi}/TrasladoSucursales/${id}`, this.headers);
  }

  /* Para cargar el archivo y hacer el Traslado de inventario masivo */
  importarArchivo(data) {
    const token = localStorage.getItem(btoa('token')) || '';
    let headers = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });
    return this.http.post<any>(`${this._urlApi}/importarTraslados`, data, {
      headers: headers,
    });
  }

  /* Para traer la data de losproductos y generar formato para hacer Traslados masivos */
  getDataProductosTrasladosSucursalesMasivos(bodega_origen, bodega_destino) {
    return this.http.get<any>(
      `${this._urlApi}/bodegaIDProdcutoStock?bodega_origen=${bodega_origen}&bodega_destino=${bodega_destino}`,
      this.headers
    );
  }

}
