import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class EventoRadianService {

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

  postPayment(type, body) {
    body['type'] = type;

    //console.log(body);
    
    return this.http.post<any>(
      `${this._urlApi}/compras`,
      body,
      this.headers
    );
  }

  /**
   * Obtener las Gasto
   *
   * @returns Observable<any>
   */
  getEventosRadian(
    page,
    fecha_inicial,
    fecha_final,
    hora_inicial,
    hora_final,
    estado,
    // tipo_factura,
    perPage,
    search,
    typeReport,
    tipo_factura,
    bodega
  ) {
    //console.log(search);
    
    return this.http.get<any>(
      `${this._urlApi}/eventosRadian?page=${page}&fecha_inicial=${fecha_inicial}&fecha_final=${fecha_final}&hora_inicial=${hora_inicial}&hora_final=${hora_final}&estado=${estado}&size=${perPage}&search=${search}&typeReport=${typeReport}&tipo_factura_electronica=${tipo_factura}&bodega=${bodega}`,
      this.headers
    );
  }

  guardarEventoRADIAN(cufe: any) {
    var body = {
      cufe: cufe,
    };

    return this.http.post<any>(
      `${this._urlApi}/eventosRadian`,
      body,
      this.headers
    );
  }


  getAbonosCreditosByFacturaId(id, size, page, search) {
    return this.http.get<any>(
      `${this._urlApi}/historial-compras-credito/${id}/abonos?size=${size}&page=${page}&search=${search}`,
      this.headers
    );
  }

  getDetalleFacturaCompra(factura_id) {
    ////console.log(factura_id)
    return this.http.get<any>(
      `${this._urlApi}/detalleFacturaCompra?factura=${factura_id}`,
      this.headers
    );
  }

  devolucionFacturaCompra(body: any, metodo_pago:any,factura_id:any) {
    body['metodo_pago'] = metodo_pago;
    body['factura'] = factura_id;
    //console.log(body);
    
    return this.http.post<any>(
      `${this._urlApi}/devolucionFacturaCompra`,
      body,
      this.headers
    );
  }

  changeStatusEventoRadian(id: any, type: any, rejectid=null) {
    
    let body = {
      "id": id,
      "event_id": type,
      "type_rejection_id": rejectid,
    };
    
    return this.http.post<any>(
      `${this._urlApi}/emitirEventoRadian`,
      body,
      this.headers
    );
  }

  delete(id: any) {
    return this.http.delete<any>(
      `${this._urlApi}/eventosRadian/${id}`,
      this.headers
    );
  }


  postEspera(body, carritoId: null) {
    let prds = {
      'carrito_compra': carritoId,
      'prds': body
    }
    return this.http.post<any>(
      `${this._urlApi}/carritoCompras`,
      prds,
      this.headers
    );
  }

  indexCarrito() {
    return this.http.get<any>(
      `${this._urlApi}/carritoCompras`,
      this.headers
    );
  }

  showCarritoDetalle(idCarrito) {
    return this.http.get<any>(
      `${this._urlApi}/detalleCarritoCompra?carrito_compra=${idCarrito}`,
      this.headers
    );
  }

  deleteCarrito(carritoId) {
    return this.http.delete<any>(
      `${this._urlApi}/carritoCompras/${carritoId}`,
      this.headers
    );
  }

}
