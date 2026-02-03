import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class UserService {
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
  getUsersPorPagina(page, search, perPage, paginate) {
    return this.http.get<any>(
      `${this._urlApi}/users?page=${page}&search=${search}&size=${perPage}&paginate=${paginate}`,
      this.headers
    );
  }

  getUsersExcel() {
    //console.log(search);
    const token = localStorage.getItem(btoa('token'));
    window.open(`${this._excel}?token=${token}`, '_blank');
    // return this.http.get<any>(`${this._excel}`).subscribe(resp => {});
  }

  addUser(body: any, tipoUser: any) {
    body['tipo_user'] = tipoUser;
    return this.http.post<any>(`${this._urlApi}/users`, body, this.headers);
  }

  putUser(body: any, id: number) {
    return this.http.put<any>(
      `${this._urlApi}/users/${id}`,
      body,
      this.headers
    );
  }

  deleteUser(id: number) {
    return this.http.delete(`${this._urlApi}/users/${id}`, this.headers);
  }

  getRol() {
    return atob(localStorage.getItem(btoa('rol')));
  }

  getNombre() {
    return atob(localStorage.getItem(btoa('nombre')));
  }

  updatePassword(con1: any, con2: any, con3: any) {
    var body = [];
    body.push({
      con1: con1,
      con2: con2,
      con3: con3,
    });

    console.log(body)
    return this.http.post<any>(`${this._urlApi}/cambiarPassword`, body, this.headers);
  }
}
