import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService } from 'src/app/services/dashboard.service';
import { FuncionesService } from 'src/app/services/funciones.service';
import { SucursalService } from 'src/app/services/sucursal.service';
import { Chart } from 'angular-highcharts';
import { YearService } from 'src/app/services/year.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MonedaService } from 'src/app/services/moneda.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  form: FormGroup; //variable que controla el formulario
  loaded = false;
  usarDecimales: Number = 1;
  moneda: string = '$';
  ventasDia: any;
  ventasMes: any[] = [];
  aniosLectivos: number[];
  createdAt: number;
  anioActual: number = new Date().getFullYear();

  dia_vencimiento: number;
  tipo_sucursal: number;
  ven_certificate: number;

  estadoProductosCreditos: any;
  permisoVentaDia: boolean = false;
  permisoNumeroFactura: boolean = false;
  permisoAbonoDia: boolean = false;
  permisoDevolucionesDia: boolean = false;
  permisoGastoDia: boolean = false;
  permisoEstadoCaja: boolean = false;
  permisoGrafica: boolean = false;

  permisoProductoBajaExistencia: boolean = false;
  permisoCreditosPendientes: boolean = false;

  /* Gestion grafica de meses */
  dias: any[] = [];
  total: any[] = [];
  chartDias: any;

  /* Gestion grafica cliente */
  chartClientes: any;
  mesCliente: any[] = [];
  totalClienteActual: any[] = [];
  totalClienteAnterior: any[] = [];

  /* Gestion ventas anuales */
  chartAnual: any;
  mesVenta: any[] = [];
  totalVenta: any[] = [];
  sucursal: any;

  constructor(
    private dasboardService: DashboardService,
    private funcionesService: FuncionesService,
    private sucursalService: SucursalService,
    private router: Router,
    private yearService: YearService,
    private formBuilder: FormBuilder, //Para formularios reactivos
    private monedaService: MonedaService,
  ) {}

  ngOnInit() {
    this.form = this.formBuilder.group({
      lectivo: [this.anioActual],
    });
    this.getSucural();
    this.getEstadoProductosCreditos();

    setTimeout(() => {
      this.permisos();
    }, 1800);

    setTimeout(() => {
      this.getVentasDia();
      this.getClientesNuevos();
      this.getVentasAnuales(this.anioActual);
    }, 1800);

    setTimeout(() => {
      if (localStorage.getItem(btoa('token')) === null) {
        this.router.navigate(['/account/login']);
      }
    }, 1000);
  }

  formatearNumber(valor: any) {
    return this.funcionesService.getFormatearNumero(valor, this.usarDecimales);
  }

  permisos() {
    let permisos = JSON.parse(
      atob(localStorage.getItem(btoa('permisos')) || ''),
    );

    const productoBajaExistencia = permisos.find(
      (element: any) => element.id === 14,
    );
    if (productoBajaExistencia) {
      this.permisoProductoBajaExistencia = true;
    }

    const creditosPendientes = permisos.find(
      (element: any) => element.id === 27,
    );
    if (creditosPendientes) {
      this.permisoCreditosPendientes = true;
    }

    const ventaDiaFind = permisos.find((element: any) => element.id === 2);
    if (ventaDiaFind) {
      this.permisoVentaDia = true;
      this.permisoDevolucionesDia = true;
    }
    const numeroFacturaFind = permisos.find((element: any) => element.id === 3);
    if (numeroFacturaFind) {
      this.permisoNumeroFactura = true;
    }
    const abonoDiaFind = permisos.find((element: any) => element.id === 4);
    if (abonoDiaFind) {
      this.permisoAbonoDia = true;
    }

    const gastoDiaFind = permisos.find((element: any) => element.id === 5);
    if (gastoDiaFind) {
      this.permisoGastoDia = true;
    }

    const estadoCajaFind = permisos.find((element: any) => element.id === 6);
    if (estadoCajaFind) {
      this.permisoEstadoCaja = true;
    }

    const graficaFind = permisos.find((element: any) => element.id === 7);
    if (graficaFind) {
      this.permisoGrafica = true;
    }
  }
  /* Consulto informacion de la sucursal*/
  private getSucural(): void {
    try {
      this.sucursal = JSON.parse(
        decodeURIComponent(atob(localStorage.getItem(btoa('sucursal')))),
      );
    } catch (error) {
      this.sucursal = '';
    }

    if (!this.sucursal) {
      this.sucursalService.getSucursal().subscribe((resp) => {
        this.sucursal = resp.data;
        this.usarDecimales = resp.data.usar_decimales;
        this.moneda = this.monedaService.obtenerSimbolo(resp.data.moneda);

        this.dia_vencimiento = resp.data.ven_d;
        this.tipo_sucursal = resp.data.tipo_sucursal;
        this.ven_certificate = resp.data.ven_certificate;

        this.createdAt = resp.data.created_at;
        this.aniosLectivos = this.yearService.getYearRangeFromCreationDate(
          this.createdAt,
        );
      });
    } else {
      this.usarDecimales = this.sucursal.usar_decimales;
      this.dia_vencimiento = this.sucursal.ven_d;
      this.tipo_sucursal = this.sucursal.tipo_sucursal;
      this.moneda = this.monedaService.obtenerSimbolo(this.sucursal.moneda);

      this.ven_certificate = this.sucursal.ven_certificate;

      this.createdAt = this.sucursal.created_at;
      this.aniosLectivos = this.yearService.getYearRangeFromCreationDate(
        this.createdAt,
      );
    }

    /*  this.sucursalService.getSucursal().subscribe((resp) => {
      this.usarDecimales = resp.data.usar_decimales;
      this.dia_vencimiento = resp.data.ven_d;
    }); */
  }

  getVentasDia() {
    this.loaded = false;
    this.dasboardService.getVentasDia().subscribe((resp) => {
      this.ventasDia = resp.total;
      this.loaded = true;
      this.getVentasMes();
    });
  }

  getEstadoProductosCreditos() {
    this.dasboardService.getEstadoProductosCreditos().subscribe((resp) => {
      this.estadoProductosCreditos = resp.data;
    });
  }

  getVentasMes() {
    if (this.permisoGrafica == true) {
      this.dasboardService.getVentasMes().subscribe((resp) => {
        this.ventasMes = resp.data;

        this.ventasMes.forEach((element: any) => {
          this.dias.push(element.dia);
          this.total.push(element.total_venta);
        });

        this.graficaDias(this.dias, this.total, this.ventasDia['mes']);
      });
    }
  }

  getClientesNuevos() {
    if (this.permisoGrafica == true) {
      this.dasboardService.getClientesNuevos().subscribe((resp) => {
        resp.data.forEach((element: any) => {
          this.mesCliente.push(element.nombre);

          this.totalClienteActual.push(element.total_cliente_actual);
          this.totalClienteAnterior.push(element.total_cliente_anterior);
        });

        this.graficaClientes(
          this.mesCliente,
          this.totalClienteActual,
          this.totalClienteAnterior,
        );
      });
    }
  }

  /* Gestiono las ventas de 1 año */
  getVentasAnuales(lectivo: any) {
    if (this.permisoGrafica == true) {
      // Limpia los datos de la gráfica antes de llenarlos nuevamente
      this.mesVenta = [];
      this.totalVenta = [];

      this.dasboardService.getVentasAnuales(lectivo).subscribe((resp) => {
        resp.data.forEach((element: any) => {
          this.mesVenta.push(element.nombre);
          this.totalVenta.push(element.total_ventas);
        });

        // Llama al método para construir la gráfica con los nuevos datos
        this.graficaVentas(this.mesVenta, this.totalVenta);
      });
    }
  }

  /* Gestiono ventas por categoria */
  graficaDias(dias: any[], total: any[], mes: any) {
    this.chartDias = new Chart({
      title: {
        text: 'VENTAS MES ' + mes,
        style: {
          fontSize: '12px',
        },
      },
      legend: {
        layout: 'vertical',
        align: 'left',
        verticalAlign: 'top',
        x: 150,
        y: 100,
        floating: true,
        borderWidth: 1,
        backgroundColor: '#FFFFFF',
      },
      xAxis: {
        categories: dias,
        labels: {
          style: {
            fontSize: '11px', // Set the desired font size here
          },
        },
        plotBands: [
          {
            // visualize the weekend
            from: 4.5,
            to: 6.5,
            color: 'rgba(68, 170, 213, .2)',
          },
        ],
      },
      yAxis: {
        title: {
          text: 'Valor en pesos',
          style: {
            fontSize: '10px',
          },
        },
      },
      tooltip: {
        shared: true,
        valueSuffix: ' Pesos',
      },
      credits: {
        enabled: false,
      },
      plotOptions: {
        areaspline: {
          fillOpacity: 0.5,
        },
      },
      series: [
        {
          type: 'areaspline',
          name: 'Total Ventas',
          data: total,
          dataLabels: {
            style: {
              fontSize: '10px', // Set the desired font size here
            },
          },
        },
      ],
    });
  }

  /* GRAFICA DE CLIENTES */
  graficaClientes(meses: any[], total_actual: any[], total_anterior: any[]) {
    this.chartClientes = new Chart({
      title: {
        text: 'CLIENTES NUEVOS',
        style: {
          fontSize: '12px',
        },
      },
      subtitle: {
        text: 'Año actual vs Año anterior',
        style: {
          fontSize: '10px',
        },
      },
      legend: {
        layout: 'vertical',
        align: 'left',
        verticalAlign: 'top',
        x: 150,
        y: 100,
        floating: true,
        borderWidth: 1,
        backgroundColor: '#FFFFFF',
      },
      xAxis: {
        categories: meses,
        labels: {
          style: {
            fontSize: '10px', // Set the desired font size here
          },
        },
        plotBands: [
          {
            // visualize the weekend
            from: 4.5,
            to: 6.5,
            color: 'rgba(68, 170, 213, .2)',
          },
        ],
      },
      yAxis: {
        title: {
          text: 'Total Clientes',
          style: {
            fontSize: '10px',
          },
        },
      },
      tooltip: {
        shared: true,
        valueSuffix: ' Número',
      },
      credits: {
        enabled: false,
      },
      plotOptions: {
        areaspline: {
          fillOpacity: 0.5,
        },
      },
      series: [
        {
          type: 'areaspline',
          name: 'Año actual',
          data: this.totalClienteActual,
          dataLabels: {
            style: {
              fontSize: '10px', // Set the desired font size here
            },
          },
        },
        {
          type: 'areaspline',
          name: 'Año anterior',
          data: this.totalClienteAnterior,
          dataLabels: {
            style: {
              fontSize: '10px', // Set the desired font size here
            },
          },
        },
      ],
    });
  }

  /* Grafica ventas anuales */
  graficaVentas(meses: any[], total: any[]) {
    this.chartAnual = new Chart({
      chart: {
        type: 'bar',
      },
      title: {
        text: 'VENTAS MENSUALES',
        style: {
          fontSize: '12px',
        },
      },
      subtitle: {
        text: '',
      },
      xAxis: {
        categories: meses,
        labels: {
          style: {
            fontSize: '10px', // Set the desired font size here
          },
        },
        title: {
          text: null,
        },
      },
      yAxis: {
        min: 0,
        title: {
          text: 'Total en pesos',
          align: 'high',
          style: {
            fontSize: '10px',
          },
        },
        labels: {
          overflow: 'justify',
          style: {
            fontSize: '10px', // Set the desired font size here
          },
        },
      },
      tooltip: {
        valueSuffix: ' Pesos',
      },
      plotOptions: {
        bar: {
          dataLabels: {
            enabled: true,
          },
        },
      },
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'top',
        x: -40,
        y: 100,
        floating: true,
        borderWidth: 1,
        backgroundColor: '#FFFFFF',
        shadow: true,
      },
      credits: {
        enabled: false,
      },
      series: [
        {
          type: 'bar',
          name: 'Total',
          data: total,
          dataLabels: {
            style: {
              fontSize: '10px', // Set the desired font size here
            },
          },
        },
      ],
    });
  }

  irCotizacion() {
    this.router.navigate([`/cotizar`]);
  }

  irVenta() {
    if (this.tipo_sucursal == 1) {
      this.router.navigate([`/vender/ventatienda`]);
    } else {
      this.router.navigate([`/vender/ventarestaurantebar`]);
    }
  }
  irProductoBajaExistencia() {
    this.router.navigate([`/inventario/productobajaexistencia`]);
  }
  irCreditos() {
    const url = '/informe/creditosventa?pendiente=1';
    this.router.navigateByUrl(url);
  }
  irProductosPorVencer() {
    this.router.navigate([`/inventario/productoPorVencer`]);
  }

  onChangeAnio(event) {
    this.getVentasAnuales(this.form.get('lectivo').value);
  }
}
