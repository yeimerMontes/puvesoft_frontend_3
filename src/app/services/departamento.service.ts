import { HeadersParam } from './../helpers/header-token';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class DepartamentoService {

  private _urlApi: string = environment.baseUrl;

  constructor(private http: HttpClient,
    @Inject(DOCUMENT) document: any
    ) {    
    let hostname = document.location.hostname;

    let environmentConfig = environment[hostname];
    
    this._urlApi = environmentConfig.backendUrl;
  }

  /**
   * Consultar listado de municipios por departamento
   */
  getMunicipiosByDepartamento(idDepartamento: number) {
    const headers = HeadersParam.getHeaders();

    return this.http.get<any>(`${this._urlApi}/municipios/${idDepartamento}`, headers);
  }

  
  /**
  * Consultar listado de departamentos
  */
  getDepartamentos() {
    const headers = HeadersParam.getHeaders();
    return this.http.get<any>(`${this._urlApi}/departamentos`, headers);
  }

}
