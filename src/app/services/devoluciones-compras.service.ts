import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class DevolucionesComprasService {

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

  getDevoluciones(page, fecha_inicial, fecha_final, hora_inicial, hora_final, usuario, perPage, search, typeReport) {
    return this.http.get<any>(
      `${this._urlApi}/historialDevolucionesCompras?page=${page}&fecha_inicial=${fecha_inicial}&hora_inicial=${hora_inicial}&fecha_final=${fecha_final}&hora_final=${hora_final}&usuario=${usuario}&size=${perPage}&search=${search}&typeReport=${typeReport}`,
      this.headers
    );
  }

  //Consulto notas creditos pos Eltronico y electronico
  getHistorialNotasAjustesDcoumentSoportesElectronica(page,  fecha_inicial, fecha_final, hora_inicial, hora_final, usuario, perPage, search, typeReport, metodo_pago, tipo_factura, tipo_nota) {
    return this.http.get<any>(
      `${this._urlApi}/historialNotasAjustesDocumentSoportesElectronico?page=${page}&fecha_inicial=${fecha_inicial}&hora_inicial=${hora_inicial}&fecha_final=${fecha_final}&hora_final=${hora_final}&usuario=${usuario}&size=${perPage}&search=${search}&typeReport=${typeReport}&metodo_pago=${metodo_pago}&tipo_factura=${tipo_factura}&tipo_nota=${tipo_nota}`,
      this.headers
    );
  }
}
