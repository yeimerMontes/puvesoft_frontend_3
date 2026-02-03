import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { HeadersParam } from '../helpers/header-token';
import { TypeReport } from '../constants/enums';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CreditosVentasService {

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

  getAbonosCreditosByFacturaId(id, size, page, search) {
    return this.http.get<any>(
      `${this._urlApi}/historial-credito/${id}/abonos?size=${size}&page=${page}&search=${search}`,
      this.headers
    );
  }

  getAbonosCreditosAll(
    page,
    paginate,
    fecha_inicial,
    fecha_final,
    hora_inicial,
    hora_final,
    usuario,
    perPage,
    metodo_pago,
    codigo = ''
    ) {
    return this.http.get<any>(
      `${this._urlApi}/historialAbonoCreditoAll?page=${page}&fecha_inicial=${fecha_inicial}&hora_inicial=${hora_inicial}&fecha_final=${fecha_final}&hora_final=${hora_final}&usuario=${usuario}&metodo_pago=${metodo_pago}&paginate=${paginate}&size=${perPage}&search=${codigo}`,
      this.headers
    );
  }

  getCreditosVentasPorPagina(
    pendiente,
    type,
    page,
    fecha_inicial,
    fecha_final,
    hora_inicial,
    hora_final,
    perPage,
    estado,
    codigo?,
    typeReport: TypeReport = TypeReport.noReport,
  ) {

    return this.http.get<any>(
      `${this._urlApi}/historial-credito?size=${perPage}&page=${page}&type=${type}&fecha_inicial=${fecha_inicial}&hora_inicial=${hora_inicial}&fecha_final=${fecha_final}&hora_final=${hora_final}&codigo=${codigo}&typeReport=${typeReport}&estado=${estado}&pendiente=${pendiente}`,
      this.headers
    );
  }

  getClientesConCreditos(
    page,
    fecha_inicial,
    fecha_final,
    perPage,
    codigo=''
  ) {
    return this.http.get<any>(
      `${this._urlApi}/historial-credito/clientes?search=${codigo}&size=${perPage}&page=${page}&fecha_inicial=${fecha_inicial}&fecha_final=${fecha_final}`,
      this.headers
    );
  }

  getCreditosByIdClient(id: number) {
    return this.http.get<any>(
      `${this._urlApi}/historial-credito/clientes/${id}`,
      this.headers
    );
  }

  addCreditoAbonoFactura(factura_venta_id: number, body: any) {
    return this.http.post<any>(
      `${this._urlApi}/creditoVentas?factura_venta_id=${factura_venta_id}&valor=${body.valor}&metodo_pago_id=${body.metodo_pago_id}&fecha_pago=${body.fecha_pago}`,
      body,
      this.headers
    );
  }

  addCreditoAbonoFacturaAll(body: any) {
    return this.http.post<any>(
      `${this._urlApi}/abonoFacturaAll`,
      body,
      this.headers
    );
  }

  deleteAbonoFactura(abono_id: number) {
    return this.http.delete<any>(`${this._urlApi}/creditoVentas/${abono_id}`, this.headers)
  }


}
