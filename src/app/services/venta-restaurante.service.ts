import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class VentaRestauranteService {
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

  addVenta(
    body: any,
    subtotal: any,
    descuento: any,
    subtotalSinImpuesto: any,
    descuentoSinImpuesto: any,
    mesa: any,
    extra: any,
    factura: number = null
  ) {
    body['factura'] = factura;
    body['subtotal'] = subtotal;
    body['subtotal_s_imp'] = subtotalSinImpuesto;
    body['descuento'] = descuento;
    body['descuento_s_imp'] = descuentoSinImpuesto;
    body['extra'] = extra;
    body['mesa_id'] = mesa;
    return this.http.post<any>(
      `${this._urlApi}/ventaRestaurante`,
      body,
      this.headers
    );
  }

  putProducto(body: any, id: number) {
    return this.http.put<any>(
      `${this._urlApi}/productos/${id}`,
      body,
      this.headers
    );
  }

  deleteProduct(idMesa, idDetalle) {
    return this.http.delete<any>(
      `${this._urlApi}/ventaRestaurante/${idMesa}/factura/${idDetalle}`,
      this.headers
    );
  }

  postEntregar(id: number) {
    return this.http.post<any>(
      `${this._urlApi}/ventaRestaurante/${id}/entregar`,
      {},
      this.headers
    );
  }

  deleteInvoiceFromTable(idMesa) {
    return this.http.delete<any>(
      `${this._urlApi}/ventaRestaurante/${idMesa}/eliminar`,
      this.headers
    );
  }

  updateInvoice(idTable, idInvoice, body) {
    return this.http.put<any>(
      `${this._urlApi}/ventaRestaurante/${idTable}/actualizar/${idInvoice}`,
      body,
      this.headers
    );
  }

  postPayment(idTable, idInvoice, type, body) {
    body['type'] = type;
    if (body.valor_efectivo) {
      let valor_efectivo = body.valor_efectivo.replaceAll(',', '');
      body['valor_efectivo'] = valor_efectivo;
    }

    return this.http.post<any>(
      `${this._urlApi}/ventaRestaurante/${idTable}/pagar/${idInvoice}`,
      body,
      this.headers
    );
  }

  postPropina(idTable, idInvoice, body) {
    return this.http.post<any>(
      `${this._urlApi}/ventaRestaurante/${idTable}/propina/${idInvoice}`,
      body,
      this.headers
    );
  }

  updateEstadoFactura(factura_id: any) {
    var body = [];
    body.push({
      factura_id: factura_id,
      envio: 'web',
    });
    return this.http.post<any>(
      `${this._urlApi}/updateEstadoFactura`,
      body,
      this.headers
    );
  }
}
