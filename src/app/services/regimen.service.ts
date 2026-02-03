import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class RegimenService {

  private _urlApi = environment.baseUrl; //url api

  constructor(private http: HttpClient,
    @Inject(DOCUMENT) document: any
    ) {    
    let hostname = document.location.hostname;

    let environmentConfig = environment[hostname];
    
    this._urlApi = environmentConfig.backendUrl;
  }

  /**
   * Obtener el operador
   * 
   * @returns Observable<any>
   */
  getRegimen() {
    const headers = HeadersParam.getHeaders();

    return this.http.get<any>(`${this._urlApi}/regimenes`, headers);
  }
 




}
