import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { HeadersParam } from '../helpers/header-token';
import { Observable } from 'rxjs';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class NominaElectronicaService {
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
  getNominaElectronicaPorPagina(
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
      `${this._urlApi}/listadoNomina?page=${page}&fecha_inicial=${fecha_inicial}&fecha_final=${fecha_final}&hora_inicial=${hora_inicial}&hora_final=${hora_final}&usuario=${usuario}&metodo_pago=${metodo_pago}&tipo_factura=${tipo_factura}&size=${perPage}&search=${search}&typeReport=${typeReport}&tipo_factura_electronica=${tipo_factura_electronica}`,
      this.headers
    );
  }

  getDetalleNominaElectronica(nomina_id, 
    page,
    empleado,
    num_nomina,
    tipo_nomina,
    estado,
    size,
    typeReport
  ) {
    //console.log(nomina_id)
    return this.http.get<any>(
      `${this._urlApi}/listadoDetalleNomina?nomina=${nomina_id}&page=${page}&empleado=${empleado}&num_nomina=${num_nomina}&tipo_nomina=${tipo_nomina}&estado=${estado}&size=${size}&typeReport=${typeReport}`,
      this.headers
    );
  }

  buscarEmpleadosNoAgregadosNomina(nomina_id) {
    //console.log(nomina_id)
    return this.http.get<any>(
      `${this._urlApi}/buscarEmpleadosNoAgregadosNomina?nomina=${nomina_id}`,
      this.headers
    );
  }

  consultarNominaEmpleado(nomina, nomina_empleado, empleado) {
    return this.http.post<any>(
      `${this._urlApi}/consultarNominaEmpleado?nomina=${nomina}&nomina_empleado=${nomina_empleado}&empleado=${empleado}`,
      {},
      this.headers
    );
  }

  addNominaElectronica(body: any) {
    return this.http.post<any>(
      `${this._urlApi}/crearNomina`,
      body,
      this.headers
    );
  }

  agregarEmpleadoNomina(body: any) {
    return this.http.post<any>(
      `${this._urlApi}/agregarEmpleadoNomina?empleado=${body.empleado}&nomina=${body.nomina}`,
      body,
      this.headers
    );
  }

  guardarNominaEmpleado(body) {
    return this.http.post<any>(
      `${this._urlApi}/guardarNominaEmpleado`,
      body,
      this.headers
    );
  }

  sendNominaElectronica(nomina, nomina_empleado, empleado) {
    return this.http.post<any>(
      `${this._urlApi}/sendElectronicPayroll?nomina=${nomina}&nomina_empleado=${nomina_empleado}&empleado=${empleado}`,
      {},
      this.headers
    );
  }

  deleteNominaElectronica(nomina, nomina_empleado, empleado, nota) {
    return this.http.post<any>(
      `${this._urlApi}/deleteElectronicPayroll?nomina=${nomina}&nomina_empleado=${nomina_empleado}&empleado=${empleado}&nota=${nota}`,
      {},
      this.headers
    );
  }

   getNominaElectronicaPdf(nomina: any, nomina_empleado: any, empleado: any, id = null, is_nomina_ajuste = 'NO'): Observable<Blob> {

    const httpOptions = HeadersParam.getHeaders();

      let params = new HttpParams()
      .set('nomina', nomina.toString())
      .set('nomina_empleado', nomina_empleado.toString())
      .set('empleado', empleado.toString())
      .set('id', id)
      .set('is_nomina_ajuste', is_nomina_ajuste);

    return this.http.get(
      `${this._urlApi}/nomina/pdf`,
      {
        headers: httpOptions.headers,
        params: params,
        responseType: 'blob'
      }
    );
  }

  listNominaAjustes(nomina, nomina_empleado, empleado) {
    return this.http.post<any>(
      `${this._urlApi}/listadoNominaAjustes?nomina=${nomina}&nomina_empleado=${nomina_empleado}&empleado=${empleado}`,
      {},
      this.headers
    );
  }
 
}
