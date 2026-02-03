import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CotizacionesService {

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

  getCotizaciones(page, fecha_inicial, fecha_final, perPage, search, typeReport) {
    return this.http.get<any>(
      `${this._urlApi}/historial-cotizaciones?page=${page}&fecha_inicial=${fecha_inicial}&fecha_final=${fecha_final}&size=${perPage}&search=${search}&typeReport=${typeReport}`,
      this.headers
    );
  }

  getDetalleCotizacion(cotizacion) {
    return this.http.get<any>(
      `${this._urlApi}/getDetalleCotizacion?cotizacion=${cotizacion}`,
      this.headers
    );
  }

    anularCotizacion(cotizacion_id: any, motivo_anulacion: any) {
    var body = [];
    body.push({
      factura: cotizacion_id,
      motivo: motivo_anulacion,
    });

    //console.log(body);
    return this.http.post<any>(
      `${this._urlApi}/anularCotizacion`,
      body,
      this.headers
    );
  }
}
