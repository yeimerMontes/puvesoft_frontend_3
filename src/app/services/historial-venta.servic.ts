import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { HeadersParam } from '../helpers/header-token';
import { Observable } from 'rxjs';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class HistorialVentaService {
  private _urlApi = environment.baseUrl;
  //private _excel = environment.userExcel;

  constructor(private http: HttpClient, @Inject(DOCUMENT) document: any) {
    let hostname = document.location.hostname;

    let environmentConfig = environment[hostname];

    this._urlApi = environmentConfig.backendUrl;
  }

  get headers() {
    return HeadersParam.getHeaders();
  }

  /**
   * Obtener las Gasto
   *
   * @returns Observable<any>
   */
  getHistorialVentaPorPagina(
    page,
    fecha_inicial,
    fecha_final,
    hora_inicial,
    hora_final,
    usuario,
    metodo_pago,
    tipo_factura,
    perPage,
    search,
    typeReport,
    tipo_factura_electronica
  ) {
    console.log(search);

    return this.http.get<any>(
      `${this._urlApi}/historialVenta?page=${page}&fecha_inicial=${fecha_inicial}&fecha_final=${fecha_final}&hora_inicial=${hora_inicial}&hora_final=${hora_final}&usuario=${usuario}&metodo_pago=${metodo_pago}&tipo_factura=${tipo_factura}&size=${perPage}&search=${search}&typeReport=${typeReport}&tipo_factura_electronica=${tipo_factura_electronica}`,
      this.headers
    );
  }

  getDetalleFacturaVenta(factura_id) {
    //console.log(factura_id)
    return this.http.get<any>(
      `${this._urlApi}/detalleFacturaVenta?factura=${factura_id}`,
      this.headers
    );
  }

  addHistorialVenta(body: any) {
    return this.http.post<any>(
      `${this._urlApi}/historialVenta`,
      body,
      this.headers
    );
  }

  devolucionFacturaVenta(body: any, metodo_pago: any, factura_id: any) {
    body['metodo_pago'] = metodo_pago;
    body['factura'] = factura_id;
    console.log(body);

    return this.http.post<any>(
      `${this._urlApi}/devolucionFacturaVenta`,
      body,
      this.headers
    );
  }

  anularFacturaVenta(factura_id: any, motivo_anulacion: any) {
    var body = [];
    body.push({
      factura: factura_id,
      motivo: motivo_anulacion,
    });

    //console.log(body);
    return this.http.post<any>(
      `${this._urlApi}/anularFacturaVenta`,
      body,
      this.headers
    );
  }

  observacionFacturaVenta(factura_id: any, observacion: any) {
    var body = [];
    body.push({
      factura: factura_id,
      observacion: observacion,
    });

    //console.log(body);
    return this.http.post<any>(
      `${this._urlApi}/observacionFacturaVenta`,
      body,
      this.headers
    );
  }

  downloadInvoiceFile(factura_id, file, type_invoce): Observable<Blob> {
    const url = `${this._urlApi}/decodeElectronicFile`;
    // Configura los parámetros de la solicitud
    const params = {
      factura_dian_id: factura_id,
      file: file,
      type_invoce: type_invoce,
    };
    // Realiza la solicitud HTTP con responseType 'blob'
    return this.http.get(url, {
      params,
      ...this.headers,
      responseType: 'blob',
    });
  }

  notaCreditoFacturacionElectronica(body: any) {
    console.log(body);

    return this.http.post<any>(
      `${this._urlApi}/saveElectronicCreditNote`,
      body,
      this.headers
    );
  }

  reenviarFacturaDian(facturaId: number) {
    const data = {
      factura_id: facturaId,
      reenvio: true,
    };

    return this.http.post<any>(
      `${this._urlApi}/facturaElectronica`,
      data,
      this.headers
    );
  }

  reenviarEmailElectronico(facturaId: number, email) {
    const data = {
      factura_id: facturaId,
      email: email
    };

    return this.http.post<any>(
      `${this._urlApi}/reenvioEmailFacturaElectronica`,
      data,
      this.headers
    );
  }

  reenviarFacturaPosElectronicaDIAN(facturaId: number) {
    const data = {
      factura_id: facturaId,
      reenvio: true,
    };
    return this.http.post<any>(
      `${this._urlApi}/posElectronico`,
      data,
      this.headers
    );
  }

  convertirRecibo(facturaId: number, convertir: number = 0) {
    const data = {
      factura_id: facturaId,
      reenvio: false,
      convertir_factura: convertir,
    };

    const urls: { [key: number]: string } = {
      2: `${this._urlApi}/posElectronico`,
      3: `${this._urlApi}/facturaElectronica`,
    };

    const url = urls[convertir];

    if (url) {
      return this.http.post<any>(url, data, this.headers);
    }
  }

  getDetalleNotaCredito(id) {
    const url = `${this._urlApi}/${id}/consultCreditInformation`;
    return this.http.get<any>(url, this.headers);
  }
}
