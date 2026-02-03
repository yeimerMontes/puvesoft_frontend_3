import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class EmpleadoService {
  private _urlApi = environment.baseUrl;

  constructor(private http: HttpClient, @Inject(DOCUMENT) document: any) {
    let hostname = document.location.hostname;

    let environmentConfig = environment[hostname];

    this._urlApi = environmentConfig.backendUrl;
  }

  get headers() {
    return HeadersParam.getHeaders();
  }

  /**
   * Obtener las Empleados
   *
   * @returns Observable<any>
   */

  getEmpleadosPorPagina(page, size, search, paginate) {
    return this.http.get<any>(
      `${this._urlApi}/empleados?page=${page}&size=${size}&search=${search}&paginate=${paginate}`,
      this.headers
    );
  }

  getEmpleadosAll() {
    return this.http.get<any>(
      `${this._urlApi}/empleadoAll`,
      this.headers
    );
  }

  addEmpleado(body: any) {
    body.salario = body.salario.replaceAll(',', '');
    body.meta = body.meta.replaceAll(',', '');

    return this.http.post<any>(`${this._urlApi}/empleados`, body, this.headers);
  }

  putEmpleado(body: any, id: number) {
    body.salario = body.salario.replaceAll(',', '');
    body.meta = body.meta.replaceAll(',', '');

    return this.http.put<any>(
      `${this._urlApi}/empleados/${id}`,
      body,
      this.headers
    );
  }

  deleteEmpleado(id: number) {
    return this.http.delete(`${this._urlApi}/empleados/${id}`, this.headers);
  }
}
