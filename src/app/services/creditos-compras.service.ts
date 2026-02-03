import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CreditosComprasService {

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
      `${this._urlApi}/historial-compras-credito/${id}/abonos?size=${size}&page=${page}&search=${search}`,
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
      `${this._urlApi}/historialAbonoCreditoCompraAll?page=${page}&fecha_inicial=${fecha_inicial}&hora_inicial=${hora_inicial}&fecha_final=${fecha_final}&hora_final=${hora_final}&usuario=${usuario}&metodo_pago=${metodo_pago}&paginate=${paginate}&size=${perPage}&search=${codigo}`,
      this.headers
    );
  }

  getCreditosComprasPorPagina(
    type,
    page,
    fecha_inicial,
    fecha_final,
    hora_inicial,
    hora_final,
    estado,
    perPage,
    typeReport,
    codigo?
  ) {

    return this.http.get<any>(
      `${this._urlApi}/historial-compras-credito?size=${perPage}&page=${page}&type=${type}&fecha_inicial=${fecha_inicial}&hora_inicial=${hora_inicial}&fecha_final=${fecha_final}&hora_final=${hora_final}&estado=${estado}&codigo=${codigo}&typeReport=${typeReport}`,
      this.headers
    );
  }


  addCreditoAbonoFactura(factura_compra_id: number, body: any) {
    return this.http.post<any>(
      `${this._urlApi}/creditoCompras?factura_compra_id=${factura_compra_id}&valor=${body.valor}&metodo_pago_id=${body.metodo_pago_id}&fecha_pago=${body.fecha_pago}`,
      body,
      this.headers
    );
  }

  addCreditoAbonoFacturaAll(body: any) {
    return this.http.post<any>(
      `${this._urlApi}/abonoFacturaAllCompra`,
      body,
      this.headers
    );
  }

  deleteAbonoFactura(abono_id: number) {
    return this.http.delete<any>(`${this._urlApi}/creditoCompras/${abono_id}`, this.headers)
  }

  getProveedoresConCreditos(
    page,
    fecha_inicial,
    fecha_final,
    perPage,
    codigo=''
  ) {
    return this.http.get<any>(
      `${this._urlApi}/historial-compras-credito/clientes?search=${codigo}&size=${perPage}&page=${page}&fecha_inicial=${fecha_inicial}&fecha_final=${fecha_final}`,
      this.headers
    );
  }

  getCreditosByIdProveedor(id: number) {
    return this.http.get<any>(
      `${this._urlApi}/historial-compras-credito/clientes/${id}`,
      this.headers
    );
  }

}