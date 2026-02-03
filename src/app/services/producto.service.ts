import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HeadersParam } from '../helpers/header-token';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
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
   * Obtener las zonas
   *
   * @returns Observable<any>
   */
  getProductosPorPagina(page, search, perPage, paginate, typeProduct, store) {
    return this.http.get<any>(
      `${this._urlApi}/productos?page=${page}&search=${search}&size=${perPage}&paginate=${paginate}&typeProduct=${typeProduct}&bodega=${store}`,
      this.headers
    );
  }

  
  geExcelProducto(page, search, perPage, paginate, typeProduct, store) {
    return this.http.get<any>(
      `${this._urlApi}/geExcelProducto?page=${page}&search=${search}&size=${perPage}&paginate=${paginate}&typeProduct=${typeProduct}&bodega=${store}`,
      this.headers
    );
  }

  getProductosPorVencer(page, search, perPage, paginate, typeProduct) {
    return this.http.get<any>(
      `${this._urlApi}/productosPorVencer?page=${page}&search=${search}&size=${perPage}&paginate=${paginate}&typeProduct=${typeProduct}`,
      this.headers
    );
  }

  /* Para traer los productos de baja existencia */
  getProductosBajaExistenciaPorPagina(page, search, perPage, paginate, bodega) {
    return this.http.get<any>(
      `${this._urlApi}/productosBajaExistencia?page=${page}&search=${search}&size=${perPage}&paginate=${paginate}&bodega=${bodega}`,
      this.headers
    );
  }

  /* Consulto el inventario */
  getInventario(page, search, perPage, paginate, bodega) {
    return this.http.get<any>(
      `${this._urlApi}/inventario?page=${page}&search=${search}&size=${perPage}&paginate=${paginate}&bodega=${bodega}`,
      this.headers
    );
  }

  getInvetarioPorCategoria(categoria, bodega) {
    return this.http.get<any>(
      `${this._urlApi}/inventarioPorCategoria?categoria=${categoria}&bodega=${bodega}`,
      this.headers
    );
  }

  getInvetarioPorCategoriaExcel(categoria, bodega) {
    return this.http.get<any>(
      `${this._urlApi}/inventarioPorCategoriaExcel?categoria=${categoria}&bodega=${bodega}`,
      this.headers
    );
  }

  addProducto(body: any) {
    if (body.valor_compra != '') {
      body.valor_compra = body.valor_compra.replaceAll(',', '');
    }
    if (body.stock != '' && body.stock > 0) {
      body.stock = body.stock.replaceAll(',', '');
    }
    if (body.stock_min != '' && body.stock_min > 0) {
      body.stock_min = body.stock_min.replaceAll(',', '');
    }
    body.valor_venta = body.valor_venta.replaceAll(',', '');
    body.valor_venta_mayor = body.valor_venta_mayor.replaceAll(',', '');
    return this.http.post<any>(`${this._urlApi}/productos`, body, this.headers);
  }

  putProducto(body: any, id: number) {
    if (body.valor_compra != '') {
      body.valor_compra = body.valor_compra.replaceAll(',', '');
    }
    if (body.stock != '' && body.stock > 0) {
      body.stock = body.stock.replaceAll(',', '');
    }
    if (body.stock_min != '' && body.stock_min > 0) {
      body.stock_min = body.stock_min.replaceAll(',', '');
    }
    body.valor_venta = body.valor_venta.replaceAll(',', '');
    body.valor_venta_mayor = body.valor_venta_mayor.replaceAll(',', '');
    return this.http.put<any>(
      `${this._urlApi}/productos/${id}`,
      body,
      this.headers
    );
  }

  putCaracterizaciones(id: number, body: any) {
    return this.http.put<any>(
      `${this._urlApi}/caracterizacion/${id}`,
      body,
      this.headers
    );
  }

  deleteProducto(id: number) {
    return this.http.delete(`${this._urlApi}/productos/${id}`, this.headers);
  }

  getProductosActivos() {
    return this.http.get<any>(`${this._urlApi}/productosActivos`, this.headers);
  }

  getProductosActivosPorCategoriasId(categoria_id: number) {
    return this.http.get<any>(
      `${this._urlApi}/productosActivosPorCategoriaId?categoria_id=${categoria_id}`,
      this.headers
    );
  }

  getBusquedaPorNombreProductosActivasCompra(producto: String) {
    return this.http.get<any>(
      `${this._urlApi}/busquedaPorNombreProductosActivasCompra?search=${producto}`,
      this.headers
    );
  }

  getBusquedaPorNombreProductosActivos(producto: String) {
    return this.http.get<any>(
      `${this._urlApi}/busquedaPorNombreProductosActivas?search=${producto}`,
      this.headers
    );
  }

  getBusquedaPorNombreProductosActivosAjuste(producto: String, bodega: String, limit5 = null) {
    return this.http.get<any>(
      `${this._urlApi}/busquedaPorNombreProductosActivosAjuste?search=${producto}&bodega=${bodega}&limit5=${limit5}`,
      this.headers
    );
  }

  busquedaPorNombreProductosActivosTraslados(producto: String, limit5 = null) {
    return this.http.get<any>(
      `${this._urlApi}/busquedaPorNombreProductosActivosTraslados?search=${producto}&limit5=${limit5}`,
      this.headers
    );
  }

  busquedaBodegaProdcutoStock(producto: String) {
    return this.http.get<any>(
      `${this._urlApi}/bodegaProdcutoStock?producto=${producto}`,
      this.headers
    );
  }



  busquedaPorCodBarraProductosActivas(producto: String) {
    return this.http.get<any>(
      `${this._urlApi}/busquedaPorCodBarraProductosActivas?search=${producto}`,
      this.headers
    );
  }

  busquedaPorCodBarraProductosActivasCompras(producto: String) {
    return this.http.get<any>(
      `${this._urlApi}/busquedaPorCodBarraProductosActivasCompras?search=${producto}`,
      this.headers
    );
  }

  productosActivasCompras() {
    return this.http.get<any>(
      `${this._urlApi}/productosActivasCompras`,
      this.headers
    );
  }

  importarArchivo(data) {
    const token = localStorage.getItem(btoa('token')) || '';
    //const headers = new HttpHeaders().set('Authorization', "Bearer " + token || '')
    let headers = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });
    return this.http.post<any>(`${this._urlApi}/importarProductos`, data, {
      headers: headers,
    });
  }

  importarUpdateProductoExcel(data) {
    const token = localStorage.getItem(btoa('token')) || '';
    //const headers = new HttpHeaders().set('Authorization', "Bearer " + token || '')
    let headers = new HttpHeaders({
      Authorization: 'Bearer ' + token,
    });
    return this.http.post<any>(`${this._urlApi}/updateExcelProductos`, data, {
      headers: headers,
    });
  }


}
