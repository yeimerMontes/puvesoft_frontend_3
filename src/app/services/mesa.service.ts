import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class MesaService {

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
   * Obtener las Mesas
   * 
   * @returns Observable<any>
   */
  getMesasPorPagina(page, search, perPage, paginate) {
    return this.http.get<any>(`${this._urlApi}/mesas?page=${page}&search=${search}&size=${perPage}&paginate=${paginate}`, this.headers);
  }

  getMesasExcel() {
    //console.log(search);
    const token = localStorage.getItem(btoa('token'));
    window.open(`${this._excel}?token=${token}`, "_blank");
    // return this.http.get<any>(`${this._excel}`).subscribe(resp => {});
  }

  addMesa(body: any) { 
    return this.http.post<any>(`${this._urlApi}/mesas`, body, this.headers);
  }

  putMesa(body: any, id: number) {
    return this.http.put<any>(`${this._urlApi}/mesas/${id}`, body, this.headers);
  }

  deleteMesa(id: number) {
    return this.http.delete(`${this._urlApi}/mesas/${id}`, this.headers);
  }

  getMesasActivasPorZonas(zona_id:number) {
    return this.http.get<any>(`${this._urlApi}/mesasActivasPorZona?zona_id=${zona_id}`, this.headers);
  }
  
  getMesaActivasById(mesaId:number) {
    return this.http.get<any>(`${this._urlApi}/mesas/${mesaId}`, this.headers);
  }

  getTableZoneOpen(zona_id:number) {
    return this.http.get<any>(`${this._urlApi}/tables-zone-open/${zona_id}`, this.headers);
  }

  putChangeTable(currentTableId, newTableId) {
    let body = {
      "newTableId": newTableId
    };
    return this.http.put<any>(`${this._urlApi}/tables/${currentTableId}/change-table`, body, this.headers);
  }

  postNotas(idTable, body) {
    return this.http.post<any>(
      `${this._urlApi}/mesas/${idTable}/notas`,
      body,
      this.headers
    );
  }

}
