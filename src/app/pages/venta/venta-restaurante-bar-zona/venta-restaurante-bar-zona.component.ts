import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { SucursalService } from 'src/app/services/sucursal.service';
import Swal from 'sweetalert2';
import { FuncionService } from 'src/app/services/funcion.service';
import { VentaRestauranteService } from 'src/app/services/venta-restaurante.service';
import { ZonaService } from 'src/app/services/zona.service';
import { MesaService } from 'src/app/services/mesa.service';

@Component({
  selector: 'app-venta-restaurante-bar-zona',
  templateUrl: './venta-restaurante-bar-zona.component.html',
  styleUrls: ['./venta-restaurante-bar-zona.component.scss'],
})
export class VentaRestauranteBarZonaComponent implements OnInit {
  zoneData = [];
  loadedMesa = false;

  isPaymentVisible = false;
  idTableSelected = null;
  dataMesas: any[] = [];

  pageView = 0;
  zonaSeleccionada: number;
  mesaSeleccionada: String;

  zonaPrinciapl: number; //para almacenar la primera zona que se consulta para luego hacer la consulta de mesas
  usarDecimales: Number = 1;
  timeClear: any;

  showTicket = false;
  idInvoice = null;

  type = 1;
  canShowTotals = true;

  /* mesa id */
  mesa: number;
  extra: String;

  subTotal = 0;
  descuento = 0;
  totalPagar = 0;
  totalPagarConPropina = 0;

  precio = 0;

  permisoBorrarPrefactura: boolean = false; //permiso para borrar la prefactura

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private zonaService: ZonaService,
    private mesaService: MesaService,
    private funcionesService: FuncionesService,
    private sucursalService: SucursalService,
    private funcionService: FuncionService,
    private ventaRestauranteService: VentaRestauranteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    /* Carga listado de zonas y mesas al iniciar el componente */
    this.getSucural();

    this.permisos();

    this.getZonas();

    setTimeout(() => {
      ////console.log('hola');
    }, 2000);
  }
  
  /* Consulto información de sucursal */
  private getSucural(): void {
    this.sucursalService.getSucursal().subscribe((resp) => {
      this.usarDecimales = resp.data.usar_decimales;
    });
  }

  /* Consulto el listado de zonas disponibles */
  getZonas() {
    this.zonaService.getZonaActivas().subscribe((resp) => {
      this.pageView = 1;
      this.zoneData = resp.data;
      this.getMesas(this.zoneData[0]['id'], this.zoneData[0]['nombre']);
    });
  }

  
  getMesas(zona_id: number, zona_nombre:string) {
    this.dataMesas = [];
    this.zonaSeleccionada = zona_id;
    this.mesaSeleccionada = zona_nombre;
    this.loadedMesa = true
    this.mesaService.getMesasActivasPorZonas(zona_id).subscribe((resp) => {
      this.loadedMesa = false
      this.dataMesas = resp.data;
      this.pageView = 1;
    });
  }

  getMesasActivasPorZonas() {
    this.loadedMesa = true
    this.mesaService
      .getMesasActivasPorZonas(this.zonaSeleccionada)
      .subscribe((resp) => {
        this.loadedMesa = false
        this.dataMesas = resp.data;
      });
  }

  formatearNumber(valor) {
    return this.funcionesService.getFormatearNumero(valor, this.usarDecimales);
  }

  validarNumero(numero) {
    let s = numero + ''.split('.');
    if (s.length > 2) {
      return {
        flag: false,
        description: 'El número tiene más de 1 (.)',
      };
    }
  }

  entregar(id) {
    this.ventaRestauranteService.postEntregar(id).subscribe(
      (resp) => {
        this.funcionService.onSuccess(resp.message, 'success', 'OK!');
        this.getMesasActivasPorZonas();
      },
      (error) => {
        this.funcionService.onSuccess(
          error.error.message,
          'error',
          'Advertencia!'
        );
      }
    );
  }

  entrar(id) {
    this.router.navigate(['/vender/ventarestaurantebar/' + id]);
  }

  entrarVentaRapida() {
    this.router.navigate(['/vender/ventatienda']);
  }

  confirmedDeleteOrder(id) {
    this.ventaRestauranteService.deleteInvoiceFromTable(id).subscribe(
      (resp) => {
        this.funcionService.onSuccess(resp.message, 'success', 'OK!');
        this.getMesasActivasPorZonas();
      },
      (error) => {
        this.funcionService.onSuccess(
          error.error.message,
          'error',
          'Advertencia!'
        );
      }
    );
  }

  eliminarPedido(item) {
    //console.log(item);
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Eliminarás el pedido de la mesa ' + item.nombre + ' de la venta',
      icon: 'warning',
      iconColor: '#DC562F',
      showCancelButton: true,
      confirmButtonColor: '#145388',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, Eliminar!',
    }).then((result) => {
      if (result.isConfirmed) {
        // TODO: Llamar el endpoint de eliminar la información
        this.confirmedDeleteOrder(item.id);
      }
    });
  }
  public proccessEditEvent(id: string) {
    this.isPaymentVisible = false;
  }

  idFactura = null;
  propina = null;
  openModalPayment(id, idFactura, precio, propina) {
    this.idFactura = idFactura;
    this.idTableSelected = id;
    this.precio = precio;
    this.propina = propina;
    this.isPaymentVisible = true;
  }

  imprimirTicket(id, type, canShowTotals) {
    this.showTicket = true;
    this.idInvoice = id;
    this.type = type;
    this.canShowTotals = canShowTotals;
  }

  closeTicket(value: string) {
    this.showTicket = false;
  }

  /* Gestion para hacer la asignación de los permisos de usuario */
  permisos() {
    let permisos = JSON.parse(atob(localStorage.getItem(btoa('permisos'))));
    //console.log(permisos);
    
    /* Consulto para saber si tiene permiso de modificar el valor de venta */
    const contain = permisos.find((element) => element.id === 44);
    if (contain) {
      this.permisoBorrarPrefactura = true;
    }

    // /* Consulto para saber si tiene permiso de modificar el porcentaje de descuento */
    // const porDescuentoFind = permisos.find((element) => element.id === 10);
    // if (porDescuentoFind) {
    //   this.permisoPorDescuento = true;
    // }
  }
}
