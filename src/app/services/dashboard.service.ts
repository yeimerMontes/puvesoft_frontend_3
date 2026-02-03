import { Inject, Injectable } from '@angular/core';
import { HeadersParam } from '../helpers/header-token';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private _urlApi = environment.baseUrl;

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

  getVentasDia() {
    return this.http.get<any>(`${this._urlApi}/ventasDia`, this.headers);
  }

  getVentasMes() {
    return this.http.get<any>(`${this._urlApi}/ventasMes`, this.headers);
  }

  getClientesNuevos() {
    return this.http.get<any>(`${this._urlApi}/clientesNuevos`, this.headers);
  }

  getVentasAnuales(lectivo) {
    return this.http.get<any>(`${this._urlApi}/ventasAnual?lectivo=${lectivo}`, this.headers);
  }

  getVentasPorCategoria() {
    return this.http.get<any>(
      `${this._urlApi}/ventasPorCategoria`,
      this.headers
    );
  }

  getEstadoProductosCreditos() {
    return this.http.get<any>(
      `${this._urlApi}/estadoProductosCreditos`,
      this.headers
    );
  }
}
