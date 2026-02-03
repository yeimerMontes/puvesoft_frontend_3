import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { HeadersParam } from '../helpers/header-token';
import { environment } from 'src/environments/environment';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ClienteService {
  private _urlApi = environment.baseUrl;
  private _excel = environment.userExcel;

  constructor(private http: HttpClient, @Inject(DOCUMENT) document: any) {
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
  getClientesPorPagina(page, search, perPage, paginate) {
    return this.http.get<any>(
      `${this._urlApi}/clientes?page=${page}&search=${search}&size=${perPage}&paginate=${paginate}`,
      this.headers
    );
  }

  /* Consulto las facturas del cliente */
  getFacturaCliente(page, search, perPage, paginate, idCliente) {
    return this.http.get<any>(
      `${this._urlApi}/facturCliente?page=${page}&search=${search}&size=${perPage}&paginate=${paginate}&idCliente=${idCliente}`,
      this.headers
    );
  }

  getMetodoPagoCliente(idCliente) {
    return this.http.get<any>(
      `${this._urlApi}/compraClienteMetodoPago?idCliente=${idCliente}`,
      this.headers
    );
  }

  getClientesExcel() {
    //console.log(search);
    const token = localStorage.getItem(btoa('token'));
    window.open(`${this._excel}?token=${token}`, '_blank');
    // return this.http.get<any>(`${this._excel}`).subscribe(resp => {});
  }

  addCliente(body: any) {
    return this.http.post<any>(`${this._urlApi}/clientes`, body, this.headers);
  }

  putCliente(body: any, id: number) {
    return this.http.put<any>(
      `${this._urlApi}/clientes/${id}`,
      body,
      this.headers
    );
  }

  deleteCliente(id: number) {
    return this.http.delete(`${this._urlApi}/clientes/${id}`, this.headers);
  }

  getBusquedaCliente(search) {
    return this.http.get<any>(
      `${this._urlApi}/buscarCliente?search=${search}`,
      this.headers
    );
  }

  getBusquedaClienteDocumento(search) {
    return this.http.get<any>(
      `${this._urlApi}/buscarClienteDocumento?search=${search}`,
      this.headers
    );
  }

  getInfoRut(identificacion) {
    return this.http.get<any>(
      `${this._urlApi}/consultarRut?identificacion=${identificacion}`,
      this.headers
    );
  }
}
