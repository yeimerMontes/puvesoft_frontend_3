import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  private _urlApi = environment.baseUrl;

  constructor(private http: HttpClient,
    @Inject(DOCUMENT) document: any
    ) {    
    let hostname = document.location.hostname;

    let environmentConfig = environment[hostname];
    
    this._urlApi = environmentConfig.backendUrl;
  }

  /**
   * Obtener los roles que pertenecen a un operador
   *
   * @returns Observable<any>
   */
  getRoles() {
    const headers = HeadersParam.getHeaders();

    return this.http.get<any>(`${this._urlApi}/sucursales/roles`, headers);
  }

  getMisPermisos(): Observable<any> {
    const headers = HeadersParam.getHeaders();

    return this.http.get<any>(`${this._urlApi}/mispermisos`, headers);
  }

  addRole(body: any) {
    const headers = HeadersParam.getHeaders();

    return this.http.post<any>(`${this._urlApi}/roles`, body, headers);
  }

  editRole(body: any, idRole: number) {
    const headers = HeadersParam.getHeaders();

    return this.http.put<any>(`${this._urlApi}/roles/${idRole}`, body, headers);
  }
}
