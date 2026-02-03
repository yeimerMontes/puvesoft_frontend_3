import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Observable, of } from 'rxjs';
import { FuncionesService } from 'src/app/services/funciones.servic';
import { SucursalService } from 'src/app/services/sucursal.service';
import Swal from 'sweetalert2';
import { estadosCreditos, selectsPagination } from 'src/app/constants/selects';
import { TypeAlert, TypeReport } from 'src/app/constants/enums';
import { HistorialVentaService } from 'src/app/services/historial-venta.servic';
import { headersMasterInterface } from 'src/app/interface/header-table-master-interface';
import { headersNominaElectronicaDetalle } from 'src/app/constants/nomina-electronica-detalle';
import { ActivatedRoute, Router } from '@angular/router';
import { FuncionService } from 'src/app/services/funcion.service';
import { NominaElectronicaService } from 'src/app/services/nomina-electronica.service';
import { meses } from 'src/app/constants/meses';
import { estadoNomina, tipoNomina } from 'src/app/constants/detalle-nomina';
import { DatePipe } from '@angular/common';
import { Location } from '@angular/common';


@Component({
  selector: 'app-detalle-nomina',
  templateUrl: './actualizar-nomina.component.html',
  styleUrls: [
    '../../informe.component.css',
    '../../../../css/modulo.css',
    '../../drowpbutton.css',
  ],
})
export class ActualizarNominaComponent implements OnInit {
  @ViewChild('staticModal3', { static: false }) childModal3?: ModalDirective;
  @ViewChild('staticModal4', { static: false }) childModal4?: ModalDirective;
  @ViewChild('staticModalNominasAjuste', { static: false }) childModalNominasAjuste?: ModalDirective;

  titleModule: string = 'Actualizar Nómina';
  headers: headersMasterInterface[] = headersNominaElectronicaDetalle;
  mesesAnio = meses;
  tipoNominaArr = tipoNomina;
  estadoNominaArr = estadoNomina;

  disabled = false;
  disabledEnviando = false;
  disabledEnvioDian = false;
  formAnular: FormGroup;
  formDevolver: FormGroup;
  formNominaElectronica: FormGroup;
  formActualizarNomina: FormGroup;

  formDevengadosCheckbox: FormGroup;
  formDeduccionesCheckbox: FormGroup;

  search: FormGroup; //variable que controla el formulario
  searchCodCredito: FormGroup; //variable que controla el formulario
  size: FormGroup;
  formMetodoPago: FormGroup; //variable que controla el formulario

  private _dataGeneral: any = {};
  private _dataFactura: any = {};
  private _dataNomina: any = {};
  private _dataEmpleado: any = {};
  private _dataUsuario;
  private _dataProductosFactura: any;

  selects: number[] = selectsPagination;
  estados: any[] = estadosCreditos;

  private _data = [];
  private _dataNominasAjustes = [];

  timeClear: any;

  action = 'Agregar Nuevo ';
  action1 = 'Agregar';

  isActionAdd: boolean = true;

  loaded = false;
  loadedNominasAjustes = false;

  horasTrabajadasDiarias = 8;

  formObjInicial = {};

  pages: Observable<any[]>;
  page = 1;
  total = 0;
  maxSize;
  nextTemplate;
  type = 1;
  total_registros;

  prevTemplate;

  is_fact_elect: boolean = false;
  usarDecimales: Number = 1;
  tipoSucursal: any;
  totalVenta: string = '0';
  totalVentaMetodoPago: string = '0';
  totalVentaMesa: string = '0';
  totalGastoPdf: string = '0';
  busquedaPorCodigo: String = '';
  erroresDianFactura: String = '';

  nitCliente: String;
  nombreCliente: string;
  factura_id: String;

  showTicket = false;
  showTicketVentaCarta = false;
  formatTiket: number;
  createdAt: number;
  idInvoice = null;

  empleadosNoAgregados: any[];

  last_page = 0;

  currentPage = 1;
  hasDevolucion = false;

  showApertura: false;

  fechaInicial: string;
  fechaFinal: string;
  horaInicial: string;
  horaFinal: string;

  nominaId: String;
  nominaEmpleadoId: String;
  empleadoId: String;

  porcentajeHoraExtraDiurna = 0;
  porcentajeHoraExtraNocturna = 0;
  porcentajeHoraRecargoNocturno = 0;
  porcentajeHoraExtraDiurnaFestivos = 0;
  porcentajeHoraRecargoDiurnoFestivos = 0;
  porcentajeHoraExtraNocturnaFestivos = 0;
  porcentajeHoraRecargoNocturnoFestivos = 0;


  originSalary = 0;

  isFacturaElectronica = false;

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private sucursalService: SucursalService,
    private funcionesService: FuncionesService,
    private historialVentaService: HistorialVentaService,
    private nominaElectronicaService: NominaElectronicaService,
    private router: Router,
    private funcionService: FuncionService,
    private activeRoute: ActivatedRoute,
    private datePipe: DatePipe,
        private _location: Location
  ) {}

  ngOnInit() {
    this.nominaId = this.activeRoute.snapshot.paramMap.get('nominaId');
    this.nominaEmpleadoId =
      this.activeRoute.snapshot.paramMap.get('nominaEmpleadoId');
    this.empleadoId = this.activeRoute.snapshot.paramMap.get('empleadoId');


    this.formAnular = this.formBuilder.group({
      motivo: ['', []],
    });

    this.formDevolver = this.formBuilder.group({
      factura: ['', []],
      metodo_pago: ['', []],
      prds: this.formBuilder.array([]),
    });

    this.formNominaElectronica = this.formBuilder.group({
      empleado: [null, []],
      nomina: [this.nominaId],
    });

    this.formActualizarNomina = this.formBuilder.group({
      fecha_pago: [this.getLastDateOfCurrentMonthFormatted(), []],
      fecha_admision: [],
      fecha_retiro: [],
      fecha_inicio_liquidacion: [this.getFirstDayOfCurrentMonth(), []],
      fecha_fin_liquidacion: [this.getLastDateOfCurrentMonthFormatted(), []],
      salario: [],
      dias_laborados: [],
      fecha_inicio_hora_extra: [],
      fecha_fin_hora_extra: [],
      subsidio_transporte: [],
      viatico_salarial: [],
      viatico_no_salarial: [],
      dotacion: [],
      teletrabajo: [],
      bono_retiro: [],
      indemnizacion: [],
      apoyo_sostenible: [],
      reintegro_devengado: [],
      vacaciones_comunes: [],
      vacaciones_compensadas: [],
      licencias_maternidad: [],
      licencias_remuneradas: [],
      licencias_no_remuneradas: [],
      huelga_legal: [],
      primas: [],
      cesantias: [],
      incapacidad_laboral: [],
      bonificaciones: [],
      ayudas: [],
      otros_conceptos: [],
      compensaciones_oe: [],
      bonificaciones_epctv: [],
      comisiones_devengado: [],
      pagao_tercero_devengado: [],
      anticipos_devengados: [],
      salud: this.formBuilder.group({
        tipo_salud: [],
        porcentaje_salud_empleado: [],
        porcentaje_salud_empleador: [],
        aporte_salud_empleado: [],
        aporte_salud_empleador: [],
      }),
      pension: this.formBuilder.group({
        tipo_pension: [],
        porcentaje_pension_empleado: [],
        porcentaje_pension_empleador: [],
        aporte_pension_empleado: [],
        aporte_pension_empleador: [],
        fondo_seguridad_pensional: [],
        tipo_seguridad_pensional: "null",
        porcentaje_seguridad_pensional: [],
        valor_seguridad_pensional: [],
        tipo_fondo_subsistencia_pensional: "null",
        porcentaje_fondo_subsistencia_pensional: [],
        valor_fondo_subsistencia_pensional: [],
      }),
      sindicato: this.formBuilder.array([]),
      sanciones: this.formBuilder.array([]),
      libranza: this.formBuilder.array([]),
      pagao_tercero_deducciones: this.formBuilder.array([]),
      anticipos_deducciones: this.formBuilder.array([]),
      otras_deducciones: this.formBuilder.array([]),
      pension_voluntaria: [],
      retencion_fuente: [],
      ahorro_fomento_construccion: [],
      coperativa: [],
      embargo_fiscal: [],
      plan_complementario: [],
      educacion: [],
      reintegro_deduccion: [],
      deuda: [],
      observacion_general: [],
      totales: this.formBuilder.group({
        total_salario_neto: [],
        total_deducciones: [],
        total_devengado: [],
      }),

    });

    this.formDevengadosCheckbox = this.formBuilder.group({
      horaExtraDiurna: [false],
      horaExtraNocturna: [false],
      horaRecargoNocturno: [false],
      horaExtraDiurnaFestivos: [false],
      horaRecargoDiurnoFestivos: [false],
      horaExtraNocturnaFestivos: [false],
      horaRecargoNocturnoFestivos: [false],
      subsidioTransporte: [false],
      viaticosSalariales: [false],
      viaticosNoSalariales: [false],
      dotacion: [false],
      teletrabajo: [false],
      bonoRetiro: [false],
      indemnizacion: [false],
      apoyoSostenible: [false],
      reintegro: [false],
      vacacionesComunes: [false],
      vacacionesCompensadas: [false],
      primas: [false],
      cesantias: [false],
      incapacidadesLaborales: [false],
      licenciaMaternidad: [false],
      licenciasRemuneradas: [false],
      licenciasNoRemuneradas: [false],
      bonificaciones: [false],
      ayudas: [false],
      huelgaLegal: [false],
      otrosConceptos: [false],
      compensacionesOE: [false],
      bonificacionesEpctv: [false],
      comisiones: [false],
      pagosTerceros: [false],
      anticipos: [false],
    });

    this.formDeduccionesCheckbox = this.formBuilder.group({
      sindicato: [false],
      sanciones: [false],
      libranza: [false],
      pagao_tercero_deducciones: [false],
      anticipos_deducciones: [false],
      otras_deducciones: [false],
      pension_voluntaria: [false],
      retencion_fuente: [false],
      ahorro_fomento_construccion: [false],
      coperativa: [false],
      embargo_fiscal: [false],
      plan_complementario: [false],
      educacion: [false],
      reintegro_deduccion: [false],
      deuda: [false],
    });

    this.getSucural();
    this.getHistorial();
  }

  background(estado_id) {
    return estado_id == 5 ? 'rgb(0 136 159 / 17%)' : '';
  }

  getMonth(month) {
    // Buscar el mes por su id
    const result = this.mesesAnio.find((m) => m.id === month);

    // Si no se encuentra, retornar "Mes inválido"
    return result ? result.name : 'Mes inválido';
  }

  formatearNumber(valor) {
    return this.funcionesService.getFormatearNumero(valor, this.usarDecimales);
  }

  /* Consulto informacion del operador */
  private getSucural(): void {
    this.sucursalService.getSucursal().subscribe((resp) => {
      this.usarDecimales = resp.data.usar_decimales;
      this.is_fact_elect = resp.data.is_fact_elect;
      this.formatTiket = resp.data.formato_ticket;
      this.createdAt = resp.data.created_at;
      this.isFacturaElectronica = resp.data.is_fact_elect;
    });
  }

  get data() {
    return this._data;
  }

  get dataNominasAjustes() {
    return this._dataNominasAjustes;
  }

  get dataNomina() {
    return this._dataNomina;
  }

  get dataGeneral() {
    return this._dataGeneral;
  }

  get dataEmpleado() {
    return this._dataEmpleado;
  }

  get dataFactura() {
    return this._dataFactura;
  }

  get dataUsuario() {
    return this._dataUsuario;
  }

  get prds() {
    return this.formDevolver.get('prds') as FormArray;
  }

  get dataProductosFactura() {
    return this._dataProductosFactura;
  }

  getLastDateOfCurrentMonthFormatted(): string {
    const now = new Date(); // Obtiene la fecha actual
    const year = now.getFullYear(); // Obtiene el año actual
    const month = now.getMonth(); // Obtiene el mes actual (0 = enero, 11 = diciembre)

    // Obtener el último día del mes actual
    const lastDate = new Date(year, month + 1, 0);

    // Formatear como YYYY-MM-DD
    const formattedDate = `${lastDate.getFullYear()}-${String(
      lastDate.getMonth() + 1
    ).padStart(2, '0')}-${String(lastDate.getDate()).padStart(2, '0')}`;

    return formattedDate;
  }

  getFirstDayOfCurrentMonth(): string {
    const now = new Date(); // Fecha actual
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1); // Primer día del mes

    // Formatear como YYYY-MM-DD
    const formattedDate = `${firstDay.getFullYear()}-${String(
      firstDay.getMonth() + 1
    ).padStart(2, '0')}-${String(firstDay.getDate()).padStart(2, '0')}`;

    return formattedDate;
  }

  getHoursBetweenDates(startDate, endDate): number {
    if (startDate == null || endDate == null) {
      return 0;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return undefined;
    }

    const diffInMilliseconds = end.getTime() - start.getTime();

    const hours = diffInMilliseconds / (1000 * 60 * 60);

    return hours;
  }

  getDaysBetweenDates(startDate, endDate): number {
    if (startDate == null || endDate == null) {
      return 0;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return undefined;
    }

    const diffInMilliseconds = end.getTime() - start.getTime();

    const diffInDays = diffInMilliseconds / (1000 * 60 * 60 * 24);

    return Math.abs(diffInDays);
  }

  calculateDaysArray(i: number, isStartDate: boolean, form: FormArray, diasControlName: string = 'dias') {
    let itemGroup = form.get([i]) as FormGroup; // Obtén el FormGroup
    let fechaInicioControl = itemGroup.get('fecha_inicio');
    let fechaFinControl = itemGroup.get('fecha_fin');

    // **Paso 1: Manejar la lógica de fecha_fin cuando se cambia fecha_inicio**
    if (isStartDate) {
      const fechaSeleccionadaStr = fechaInicioControl.value; // Obtiene el string del input type="date" (ej: "2025-05-20")

      if (fechaSeleccionadaStr) {
        // Convertir a Date object. Para type="date", new Date() suele interpretar como medianoche local
        const fechaInicioOriginal = new Date(fechaSeleccionadaStr);

        // Crear una nueva fecha para fecha_fin
        const fechaFinCalculada = new Date(fechaInicioOriginal);
        fechaFinCalculada.setDate(fechaFinCalculada.getDate() + 1); // Sumar 1 día

        // Formatear a string compatible con input type="date" (YYYY-MM-DD)
        // new Date().toISOString().slice(0, 10) es seguro para type="date" porque no hay hora que desplace.
        const formattedFechaFin = fechaFinCalculada.toISOString().slice(0, 10);

        // Actualiza el control de fecha_fin
        fechaFinControl.setValue(formattedFechaFin, { emitEvent: false }); // Usar emitEvent: false para evitar bucles infinitos
      } else {
        // Si se borra fecha_inicio, también borra fecha_fin
        fechaFinControl.setValue(null, { emitEvent: false });
      }
    }

    // **Paso 2: Calcular los días (se ejecuta después de ajustar fecha_fin si es necesario)**
    const fechaInicioVal = fechaInicioControl.value;
    const fechaFinVal = fechaFinControl.value;

    if (fechaInicioVal && fechaFinVal) {
      // Convertir a objetos Date para el cálculo
      const inicio = new Date(fechaInicioVal);
      const fin = new Date(fechaFinVal);

      let days = this.getDaysBetweenDates(inicio, fin); // Pasa objetos Date

      if (days == undefined || days < 1) { // Asegúrate de que haya al menos 1 día de diferencia
        this.onSuccess(
          'Fecha Incorrecta',
          'Debe escoger una fecha con al menos 1 día de diferencia',
          TypeAlert.warning
        );
        // Resetea solo el control que se modificó si la validación falla
        if (isStartDate) {
          fechaInicioControl.reset(null);
        } else {
          fechaFinControl.reset(null);
        }
        itemGroup.get(diasControlName).reset(0);
        // Opcional: Si tienes otro campo de pago que dependa de los días, también resetea
        // itemGroup.get('pago').reset(0);
        this.calculateTotal(); // Recalcular el total si los días se resetean
        return;
      }

      itemGroup.get(diasControlName).reset(days); // Actualiza el campo de días

      // Aquí puedes añadir cualquier otra lógica de cálculo que dependa de los días
      // Por ejemplo, un pago basado en días
      // let pagoPorDias = valorDia * days;
      // itemGroup.get('pago_por_dias').reset(pagoPorDias);

      this.calculateTotal(); // Llama a tu función de cálculo total
    } else {
      // Si alguna de las fechas está vacía, resetea los días
      itemGroup.get(diasControlName).reset(0);
      // itemGroup.get('pago').reset(0); // Si aplica
      this.calculateTotal();
    }
  }


  calculateHour(i: number, isStartDate: boolean, formArray: FormArray, porcentaje: number) {
    let itemGroup = formArray.get([i]) as FormGroup; // Obtén el FormGroup
    let fechaInicioControl = itemGroup.get('fecha_inicio');
    let fechaFinControl = itemGroup.get('fecha_fin');

    // **Paso 1: Manejar la lógica de fecha_fin cuando se cambia fecha_inicio**
    if (isStartDate) {
      const fechaSeleccionadaStr = fechaInicioControl.value; // Obtiene el string del input datetime-local

      if (fechaSeleccionadaStr) {
        // Convertir a Date object. Si el string es de un datetime-local (YYYY-MM-DDTHH:MM),
        // Date lo interpreta como hora local, lo cual es deseable.
        const fechaInicioOriginal = new Date(fechaSeleccionadaStr);

        // Crear una nueva fecha para fecha_fin
        const fechaFinCalculada = new Date(fechaInicioOriginal);
        fechaFinCalculada.setHours(fechaFinCalculada.getHours() + 1); // Sumar 1 hora en la hora local

        // Formatear a string compatible con input type="datetime-local" (YYYY-MM-DDTHH:MM)
        // Usamos toISOString para obtener un string en formato UTC, luego ajustamos a local
        // y lo truncamos. Esto puede ser complicado con zonas horarias.
        // Una forma más directa es construir el string manualmente o usar una librería.
        // Para simplificar, asumiremos que `new Date(string).toISOString().slice(0, 16)` es suficiente
        // para mantener la hora local si el input original era local.
        // Si no, la mejor práctica es:
        const year = fechaFinCalculada.getFullYear();
        const month = (fechaFinCalculada.getMonth() + 1).toString().padStart(2, '0');
        const day = fechaFinCalculada.getDate().toString().padStart(2, '0');
        const hours = fechaFinCalculada.getHours().toString().padStart(2, '0');
        const minutes = fechaFinCalculada.getMinutes().toString().padStart(2, '0');
        const formattedFechaFin = `${year}-${month}-${day}T${hours}:${minutes}`;

        fechaFinControl.setValue(formattedFechaFin, { emitEvent: false }); // Usar emitEvent: false para evitar bucles infinitos
      } else {
        fechaFinControl.setValue(null, { emitEvent: false });
      }
    }

    // **Paso 2: Calcular las horas y el pago (se ejecuta después de ajustar fecha_fin si es necesario)**
    const fechaInicioVal = fechaInicioControl.value;
    const fechaFinVal = fechaFinControl.value;

    if (fechaInicioVal && fechaFinVal) {
      // Convertir a objetos Date para el cálculo.
      // Es crucial que getHoursBetweenDates también maneje consistentemente las zonas horarias.
      // Si getHoursBetweenDates compara milisegundos UTC, entonces las fechas deben convertirse a UTC.
      // Si compara objetos Date directamente y confía en el comportamiento local, está bien.
      // Asumiré que getHoursBetweenDates espera Date objects o strings que pueden ser parseados.
      const inicio = new Date(fechaInicioVal);
      const fin = new Date(fechaFinVal);

      let hour = this.getHoursBetweenDates(inicio, fin); // Pasa objetos Date

      if (hour == undefined || hour < 1) { // Asegúrate de que haya al menos 1 hora de diferencia
        this.onSuccess(
          'Fecha Incorrecta',
          'Debe escoger una fecha con al menos 1 hora de diferencia',
          TypeAlert.warning
        );
        // Resetea solo el control que se modificó si la validación falla
        if (isStartDate) {
          fechaInicioControl.reset(null);
        } else {
          fechaFinControl.reset(null);
        }
        itemGroup.get('cantidad_horas').reset(0);
        itemGroup.get('pago').reset(0);
        this.calculateTotal(); // Recalcular el total si las horas se resetean
        return;
      }

      let hourInteger = this.roundToNearestInteger(hour);
      itemGroup.get('cantidad_horas').reset(hourInteger);

      let salario = +((this.formActualizarNomina.get('salario').value + "").replaceAll(",", ""));
      let diasLaborados = this.formActualizarNomina.get('dias_laborados').value;

      let valorHoraOrdinaria = salario / (diasLaborados * this.horasTrabajadasDiarias);
      let valorHoraDiariaExtra = valorHoraOrdinaria * (porcentaje / 100 + 1);

      itemGroup.get('pago').reset(valorHoraDiariaExtra * hourInteger);

      this.calculateTotal();
    } else {
      // Si alguna de las fechas está vacía, resetea las horas y el pago
      itemGroup.get('cantidad_horas').reset(0);
      itemGroup.get('pago').reset(0);
      this.calculateTotal(); // Recalcula el total si las horas cambian a 0
    }
  }

  calculateDays(isStartDate) {
    let days = this.getDaysBetweenDates(
      this.formActualizarNomina.get('fecha_inicio_liquidacion').value,
      this.formActualizarNomina.get('fecha_fin_liquidacion').value
    );
    if (days == undefined) {
      this.onSuccess(
        'Fecha Incorrecta',
        'Debe escoger una fecha con al menos 1 día de diferencia',
        TypeAlert.warning
      );
      if (isStartDate) {
        this.formActualizarNomina.get('fecha_inicio_liquidacion').reset(null);
      } else {
        this.formActualizarNomina.get('fecha_fin_liquidacion').reset(null);
      }
      this.formActualizarNomina.get('dias_laborados').reset(0);
      return;
    }
    this.formActualizarNomina.get('dias_laborados').reset(days+1);

    this.calculateTotal();
  }

  roundToNearestInteger(value: number): number {
    return Math.round(value);
  }

  getService() {
    this.nominaElectronicaService
      .consultarNominaEmpleado(
        this.nominaId,
        this.nominaEmpleadoId,
        this.empleadoId
      )
      .subscribe((resp) => {
        this._dataGeneral = resp.data;
        this._dataNomina = resp.data.info_nomina;
        this._dataEmpleado = resp.data.infoEmpleado;

        this.inicializarFormularios(resp.data);

        this.porcentajeHoraExtraDiurna =
          +resp.data.hora_extra_diurna.info.porcentaje;

        this.porcentajeHoraExtraNocturna =
          +resp.data.hora_extra_nocturna.info.porcentaje;

        this.porcentajeHoraRecargoNocturno =
          +resp.data.hora_recargo_nocturno.info.porcentaje;

        this.porcentajeHoraExtraDiurnaFestivos =
          +resp.data.hora_extra_diurna_dominical_festivos.info.porcentaje;

        this.porcentajeHoraRecargoDiurnoFestivos =
          +resp.data.hora_recargo_diurno_dominical_festivos.info.porcentaje;

        this.porcentajeHoraExtraNocturnaFestivos =
          +resp.data.hora_extra_nocturna_dominical_festivos.info.porcentaje;

        this.porcentajeHoraRecargoNocturnoFestivos =
          +resp.data.hora_recargo_nocturno_dominical_festivos.info.porcentaje;

        this.loaded = true;

        this.calculateTotal();

        this.formObjInicial = this.formActualizarNomina.value;

        console.log('Datos de la nómina:', this.formObjInicial);
      });
  }

   getNominasAjustes() {
    this.loadedNominasAjustes = false;
    this.nominaElectronicaService
      .listNominaAjustes(
        this.nominaId,
        this.nominaEmpleadoId,
        this.empleadoId
      )
      .subscribe((resp) => {
        this._dataNominasAjustes = resp.data;
        this.loadedNominasAjustes = true;
      });
  }

  inicializarFormularios(data) {
    let fecha_pago =
      data.fecha_pago ?? this.getLastDateOfCurrentMonthFormatted();

    let fecha_admision = this.getFormattedDate(data.fecha_admision);

    let fecha_retiro = data.fecha_retiro
      ? this.getFormattedDate(data.fecha_retiro)
      : null;

    let has_fecha_retiro = fecha_retiro ? true : false;

    let fecha_inicio_liquidacion = data.fecha_inicio_liquidacion
      ? this.getFormattedDate(data.fecha_inicio_liquidacion)
      : this.getFirstDayOfCurrentMonth();

    let fecha_fin_liquidacion = data.fecha_fin_liquidacion
      ? this.getFormattedDate(data.fecha_fin_liquidacion)
      : this.getLastDateOfCurrentMonthFormatted();

    let dias_laborados = data.dias_laborados
      ? data.dias_laborados
      : this.getDaysBetweenDates(
          this.getFirstDayOfCurrentMonth(),
          this.getLastDateOfCurrentMonthFormatted()
        );

    this.originSalary = +(data.salario);

    this.formActualizarNomina = this.formBuilder.group({
      nomina: this.nominaId,
      empleado: this.empleadoId,
      nomina_empleado: this.nominaEmpleadoId,
      fecha_pago: [this.getLastDateOfCurrentMonthFormatted(), []],
      fecha_admision: [fecha_admision, []],
      has_fecha_retiro: [has_fecha_retiro, []],
      fecha_retiro: [fecha_retiro, []],
      fecha_inicio_liquidacion: [fecha_inicio_liquidacion, []],
      fecha_fin_liquidacion: [fecha_fin_liquidacion, []],
      salario: [this.formatearNumber(+data.salario)],
      dias_laborados: [dias_laborados],
      fecha_inicio_hora_extra: [],
      fecha_fin_hora_extra: [],
      hora_extra_diurna: this.formBuilder.array([]),
      hora_extra_nocturna: this.formBuilder.array([]),
      hora_recargo_nocturno: this.formBuilder.array([]),
      hora_extra_diurna_dominical_festivos: this.formBuilder.array([]),
      hora_recargo_diurno_dominical_festivos: this.formBuilder.array([]),
      hora_extra_nocturna_dominical_festivos: this.formBuilder.array([]),
      hora_recargo_nocturno_dominical_festivos: this.formBuilder.array([]),
      subsidio_transporte: [this.formatearNumber(+data.subsidio_transporte)],
      viatico_salarial: [this.formatearNumber(+data.viatico_salarial)],
      viatico_no_salarial: [this.formatearNumber(+data.viatico_no_salarial)],
      dotacion: [this.formatearNumber(+data.dotacion)],
      teletrabajo: [this.formatearNumber(+data.teletrabajo)],
      bono_retiro: [this.formatearNumber(+data.bono_retiro)],
      indemnizacion: [this.formatearNumber(+data.indemnizacion)],
      apoyo_sostenible: [this.formatearNumber(+data.apoyo_sostenible)],
      reintegro_devengado: [this.formatearNumber(+data.reintegro_devengado)],
      vacaciones_comunes: this.formBuilder.array([]),
      vacaciones_compensadas: this.formBuilder.array([]),
      licencias_maternidad: this.formBuilder.array([]),
      licencias_remuneradas: this.formBuilder.array([]),
      licencias_no_remuneradas: this.formBuilder.array([]),
      huelga_legal: this.formBuilder.array([]),
      primas: this.formBuilder.array([]),
      cesantias: this.formBuilder.array([]),
      incapacidad_laboral: this.formBuilder.array([]),
      bonificaciones: this.formBuilder.array([]),
      ayudas: this.formBuilder.array([]),
      otros_conceptos: this.formBuilder.array([]),
      compensaciones_oe: this.formBuilder.array([]),
      bonificaciones_epctv: this.formBuilder.array([]),
      comisiones_devengado: this.formBuilder.array([]),
      pagao_tercero_devengado: this.formBuilder.array([]),
      anticipos_devengados: this.formBuilder.array([]),
      salud: this.formBuilder.group({
        tipo_salud: "1",
        porcentaje_salud_empleado: "4.00",
        porcentaje_salud_empleador: "8.50",
        aporte_salud_empleado: [],
        aporte_salud_empleador: [],
      }),
      pension: this.formBuilder.group({
        tipo_pension: "5",
        porcentaje_pension_empleado: "4.00",
        porcentaje_pension_empleador: "12.00",
        aporte_pension_empleado: [],
        aporte_pension_empleador: [],
        fondo_seguridad_pensional: [],
        tipo_seguridad_pensional: "null",
        porcentaje_seguridad_pensional: [],
        valor_seguridad_pensional: [],
        tipo_fondo_subsistencia_pensional: "null",
        porcentaje_fondo_subsistencia_pensional: [],
        valor_fondo_subsistencia_pensional: [],
      }),
      sindicato: this.formBuilder.array([]),
      sanciones: this.formBuilder.array([]),
      libranza: this.formBuilder.array([]),
      pagao_tercero_deducciones: this.formBuilder.array([]),
      anticipos_deducciones: this.formBuilder.array([]),
      otras_deducciones: this.formBuilder.array([]),
      pension_voluntaria: [this.formatearNumber(+data.pension_voluntaria)],
      retencion_fuente: [this.formatearNumber(+data.retencion_fuente)],
      ahorro_fomento_construccion: [this.formatearNumber(+data.ahorro_fomento_construccion)],
      coperativa: [this.formatearNumber(+data.coperativa)],
      embargo_fiscal: [this.formatearNumber(+data.embargo_fiscal)],
      plan_complementario: [this.formatearNumber(+data.plan_complementario)],
      educacion: [this.formatearNumber(+data.educacion)],
      reintegro_deduccion: [this.formatearNumber(+data.reintegro_deduccion)],
      deuda: [this.formatearNumber(+data.deuda)],
      observacion_general: data.observacion_general,
      totales: this.formBuilder.group({
        total_salario_neto: [+data.total_devengado- (+data.total_deducciones)],
        total_deducciones: [+data.total_deducciones],
        total_devengado: [+data.total_devengado],
      }),

    });

    this.completeFormHour(this.hora_extra_diurna, 'horaExtraDiurna', data.hora_extra_diurna.data);
    this.completeFormHour(this.hora_extra_nocturna, 'horaExtraNocturna', data.hora_extra_nocturna.data);
    this.completeFormHour(this.hora_recargo_nocturno, 'horaRecargoNocturno', data.hora_recargo_nocturno.data);
    this.completeFormHour(this.hora_extra_diurna_dominical_festivos, 'horaExtraDiurnaFestivos', data.hora_extra_diurna_dominical_festivos.data);
    this.completeFormHour(this.hora_recargo_diurno_dominical_festivos, 'horaRecargoDiurnoFestivos', data.hora_recargo_diurno_dominical_festivos.data);
    this.completeFormHour(this.hora_extra_nocturna_dominical_festivos, 'horaExtraNocturnaFestivos', data.hora_extra_nocturna_dominical_festivos.data);
    this.completeFormHour(this.hora_recargo_nocturno_dominical_festivos, 'horaRecargoNocturnoFestivos', data.hora_recargo_nocturno_dominical_festivos.data);

    this.completeFormVacationsHour(this.vacaciones_comunes, 'vacacionesComunes', data.vacaciones_comunes);
    this.completeFormVacationsHour(this.vacaciones_compensadas, 'vacacionesCompensadas', data.vacaciones_compensadas);

    this.completeDataGeneric('primas', data.primas, 'primas');
    this.completeDataGeneric('cesantias', data.cesantias, 'cesantias');
    this.completeDataGeneric('incapacidadesLaborales', data.incapacidad_laboral, 'incapacidad_laboral');

    this.completeFormVacationsHour(this.licencias_maternidad, 'licenciaMaternidad', data.licencias_maternidad);
    this.completeFormVacationsHour(this.licencias_remuneradas, 'licenciasRemuneradas', data.licencias_remuneradas);
    this.completeFormNoRemuneradas(this.licencias_no_remuneradas, 'licenciasNoRemuneradas', data.licencias_no_remuneradas);

    this.completeDataGeneric('bonificaciones', data.bonificaciones, 'bonificaciones');
    this.completeDataGeneric('ayudas', data.ayudas, 'ayudas');

    this.completeFormVacationsHour(this.huelga_legal, 'huelgaLegal', data.huelga_legal);

    this.completeDataGeneric('otrosConceptos', data.otros_conceptos, 'otros_conceptos');
    this.completeDataGeneric('compensacionesOE', data.compensaciones_oe, 'compensaciones_oe');
    this.completeDataGeneric('bonificacionesEpctv', data.bonificaciones_epctv, 'bonificaciones_epctv');
    this.completeDataGeneric('comisiones', data.comisiones_devengado, 'comisiones_devengado');
    this.completeDataGeneric('pagosTerceros', data.pago_tercero_devengado, 'pagao_tercero_devengado');
    this.completeDataGeneric('anticipos', data.anticipos_devengados, 'anticipos_devengados');

    console.log(data)
    
    this.completeDataGeneric('sindicato', data.sindicato, 'sindicato', false);
    this.completeDataGeneric('sanciones', data.sanciones, 'sanciones', false);
    this.completeDataGeneric('libranza', data.libranza, 'libranza', false);
    this.completeDataGeneric('pagao_tercero_deducciones', data.pago_tercero_deducciones, 'pagao_tercero_deducciones', false);
    this.completeDataGeneric('anticipos_deducciones', data.anticipos_deducciones, 'anticipos_deducciones', false);
    this.completeDataGeneric('otras_deducciones', data.otras_deducciones, 'otras_deducciones', false);

    this.changeTipoSalud("1");

    this.salud.reset({
      aporte_salud_empleado: this.formatearNumber(data.salud.aporte_salud_empleado),
      aporte_salud_empleador: +data.salud.aporte_salud_empleador,
      porcentaje_salud_empleado: +data.salud.porcentaje_salud_empleado,
      porcentaje_salud_empleador: +data.salud.porcentaje_salud_empleador,
      tipo_salud: (data.salud.tipo_salud != null) ? data.salud.tipo_salud+"" : "1"
    });

    this.changeTipoPension("5");

     this.pension.reset({
      tipo_pension: data.pension.tipo_pension == null ? "null" : data.pension.tipo_pension+"",
      porcentaje_pension_empleado: data.pension.porcentaje_pension_empleado != null ? +data.pension.porcentaje_pension_empleado : 0,
      porcentaje_pension_empleador: data.pension.porcentaje_pension_empleador != null ? +data.pension.porcentaje_pension_empleador : 0,
      aporte_pension_empleado: data.pension.aporte_pension_empleado != null ? this.formatearNumber(data.pension.aporte_pension_empleado) : 0,
      aporte_pension_empleador: data.pension.aporte_pension_empleador != null ? +data.pension.aporte_pension_empleador : 0,
      fondo_seguridad_pensional: data.pension.fondo_seguridad_pensional,
      tipo_seguridad_pensional: (data.pension.tipo_seguridad_pensional == null || data.pension.tipo_seguridad_pensional == 0) ? "null" : data.pension.tipo_seguridad_pensional,
      porcentaje_seguridad_pensional: data.pension.porcentaje_seguridad_pensional != null ? +data.pension.porcentaje_seguridad_pensional : 0,
      valor_seguridad_pensional: data.pension.valor_seguridad_pensional != null ? +data.pension.valor_seguridad_pensional : 0,
      tipo_fondo_subsistencia_pensional: (data.pension.tipo_fondo_subsistencia_pensional == null || data.pension.tipo_fondo_subsistencia_pensional == 0) ? "null" : data.pension.tipo_fondo_subsistencia_pensional,
      porcentaje_fondo_subsistencia_pensional: data.pension.porcentaje_fondo_subsistencia_pensional != null ? +data.pension.porcentaje_fondo_subsistencia_pensional : 0,
      valor_fondo_subsistencia_pensional: data.pension.valor_fondo_subsistencia_pensional != null ? +data.pension.valor_fondo_subsistencia_pensional : 0,
    });

    this.formDevengadosCheckbox
      .get('subsidioTransporte')
      .reset(+data.subsidio_transporte > 0 ? true : false);
    this.formDevengadosCheckbox
      .get('viaticosSalariales')
      .reset(+data.viatico_salarial > 0 ? true : false);
    this.formDevengadosCheckbox
      .get('viaticosNoSalariales')
      .reset(+data.viatico_no_salarial > 0 ? true : false);
    this.formDevengadosCheckbox
      .get('dotacion')
      .reset(+data.dotacion > 0 ? true : false);
    this.formDevengadosCheckbox
      .get('teletrabajo')
      .reset(+data.teletrabajo > 0 ? true : false);
    this.formDevengadosCheckbox
      .get('bonoRetiro')
      .reset(+data.bono_retiro > 0 ? true : false);
    this.formDevengadosCheckbox
      .get('indemnizacion')
      .reset(+data.indemnizacion > 0 ? true : false);
    this.formDevengadosCheckbox
      .get('apoyoSostenible')
      .reset(+data.apoyo_sostenible > 0 ? true : false);
    this.formDevengadosCheckbox
      .get('reintegro')
      .reset(+data.reintegro_devengado > 0 ? true : false);

      this.formDeduccionesCheckbox
      .get('pension_voluntaria')
      .reset(+data.pension_voluntaria > 0 ? true : false);
      this.formDeduccionesCheckbox
      .get('retencion_fuente')
      .reset(+data.retencion_fuente > 0 ? true : false);
      this.formDeduccionesCheckbox
      .get('ahorro_fomento_construccion')
      .reset(+data.ahorro_fomento_construccion > 0 ? true : false);
       this.formDeduccionesCheckbox
      .get('coperativa')
      .reset(+data.coperativa > 0 ? true : false);
       this.formDeduccionesCheckbox
      .get('embargo_fiscal')
      .reset(+data.embargo_fiscal > 0 ? true : false);
       this.formDeduccionesCheckbox
      .get('plan_complementario')
      .reset(+data.plan_complementario > 0 ? true : false);
       this.formDeduccionesCheckbox
      .get('educacion')
      .reset(+data.educacion > 0 ? true : false);
       this.formDeduccionesCheckbox
      .get('reintegro_deduccion')
      .reset(+data.reintegro_deduccion > 0 ? true : false);
       this.formDeduccionesCheckbox
      .get('deuda')
      .reset(+data.deuda > 0 ? true : false);
  }

  completeFormHour(form: FormArray, nameCheckbox, data) {
    this.formDevengadosCheckbox
      .get(nameCheckbox)
      .reset(data.length != 0 ? true : false);

    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      form.push( 
        this.formBuilder.group({
        fecha_inicio: [element.fecha_inicio],
        fecha_fin: [element.fecha_fin],
        cantidad_horas: [+element.cantidad_horas],
        porcentaje: [+element.porcentaje],
        pago: [+element.pago],
      })) 
    }

  }

  completeFormVacationsHour(form: FormArray, nameCheckbox, data) {
    this.formDevengadosCheckbox
      .get(nameCheckbox)
      .reset(data.length != 0 ? true : false);

    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      form.push( 
        this.formBuilder.group({
        fecha_inicio: [element.fecha_inicio],
        fecha_fin: [element.fecha_fin],
        cantidad_dias: [+element.cantidad_dias],
        pago: [this.formatearNumber(+element.pago)],
      })) 
    }

  }

  completeFormNoRemuneradas(form: FormArray, nameCheckbox, data) {
    this.formDevengadosCheckbox
      .get(nameCheckbox)
      .reset(data.length != 0 ? true : false);

    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      form.push( 
        this.formBuilder.group({
        fecha_inicio: [element.fecha_inicio],
        fecha_fin: [element.fecha_fin],
        cantidad_dias: [+element.cantidad_dias],
        pago: [0],
      })) 
    }

  }

  
  completeDataGeneric(nameCheckbox, data, nameArray, isDevengados = true) {

    if (isDevengados) {
      this.formDevengadosCheckbox
      .get(nameCheckbox)
      .reset(data.length != 0 ? true : false);
    } else {
      this.formDeduccionesCheckbox
      .get(nameCheckbox)
      .reset(data.length != 0 ? true : false);
    }
    
    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      let formItem2 = null;
      switch(nameArray) {
        case "primas":
          this.addPrimas(this.primas, element);
          break;
        case "cesantias":
          this.addCesantias(this.cesantias, element);
          break;
        case "incapacidad_laboral":
          this.addIncapacidadLaboral(this.incapacidad_laboral, element);
          break;
        case "bonificaciones":
          this.addBonificaciones(this.bonificaciones, 1, element);
          break;
        case "ayudas":
          this.addBonificaciones(this.ayudas, 1, element);
          break;
        case "otros_conceptos":
          this.addOtrosConceptos(this.otros_conceptos, element);
          break;
        case "compensaciones_oe":
          this.addCompesancionesOE(this.compensaciones_oe, element);
          break;
        case "bonificaciones_epctv":
          this.addBonificacionesEpctv(this.bonificaciones_epctv, element);
          break;
        case "comisiones_devengado":
          this.addComisionesDevengado(this.comisiones_devengado, 1, element);
          break;
        case "pagao_tercero_devengado":
          this.addComisionesDevengado(this.pagao_tercero_devengado, 2, element);
          break;
        case "anticipos_devengados":
          this.addComisionesDevengado(this.anticipos_devengados, 3, element);
          break;
        case "sindicato":
          formItem2 = this.buildSindicato(element);
          this.appendItemDeducciones(this.sindicato, formItem2);
          break;
        case "sanciones":
          formItem2 = this.buildSanciones(element);
          this.appendItemDeducciones(this.sanciones, formItem2);
          break;
        case "libranza":
          formItem2 = this.buildLibranza(element);
          this.appendItemDeducciones(this.libranza, formItem2);
          break;
        case "pagao_tercero_deducciones":
          formItem2 = this.buildPagoTerceroDeducciones(element);
          this.appendItemDeducciones(this.pagao_tercero_deducciones, formItem2);
          break;
        case "anticipos_deducciones":
          formItem2 = this.buildAnticiposDeducciones(element);
          this.appendItemDeducciones(this.anticipos_deducciones, formItem2);
          break;
        case "otras_deducciones":
          formItem2 = this.buildOtrasDeducciones(element);
          this.appendItemDeducciones(this.otras_deducciones, formItem2);
          break;


      }
      
    }

  }

  

  get hora_extra_diurna(): FormArray {
    return this.formActualizarNomina.get('hora_extra_diurna') as FormArray;
  }

  get hora_extra_nocturna(): FormArray {
    return this.formActualizarNomina.get('hora_extra_nocturna') as FormArray;
  }

  get hora_recargo_nocturno(): FormArray {
    return this.formActualizarNomina.get('hora_recargo_nocturno') as FormArray;
  }

  get hora_extra_diurna_dominical_festivos(): FormArray {
    return this.formActualizarNomina.get(
      'hora_extra_diurna_dominical_festivos'
    ) as FormArray;
  }

  get hora_recargo_diurno_dominical_festivos(): FormArray {
    return this.formActualizarNomina.get(
      'hora_recargo_diurno_dominical_festivos'
    ) as FormArray;
  }

  get hora_extra_nocturna_dominical_festivos(): FormArray {
    return this.formActualizarNomina.get(
      'hora_extra_nocturna_dominical_festivos'
    ) as FormArray;
  }

  get hora_recargo_nocturno_dominical_festivos(): FormArray {
    return this.formActualizarNomina.get(
      'hora_recargo_nocturno_dominical_festivos'
    ) as FormArray;
  }

  get vacaciones_comunes(): FormArray {
    return this.formActualizarNomina.get('vacaciones_comunes') as FormArray;
  }

  get vacaciones_compensadas(): FormArray {
    return this.formActualizarNomina.get('vacaciones_compensadas') as FormArray;
  }

  get licencias_maternidad(): FormArray {
    return this.formActualizarNomina.get('licencias_maternidad') as FormArray;
  }

  get licencias_remuneradas(): FormArray {
    return this.formActualizarNomina.get('licencias_remuneradas') as FormArray;
  }

  get licencias_no_remuneradas(): FormArray {
    return this.formActualizarNomina.get(
      'licencias_no_remuneradas'
    ) as FormArray;
  }

  get huelga_legal(): FormArray {
    return this.formActualizarNomina.get('huelga_legal') as FormArray;
  }

  get primas(): FormArray {
    return this.formActualizarNomina.get('primas') as FormArray;
  }

  get cesantias(): FormArray {
    return this.formActualizarNomina.get('cesantias') as FormArray;
  }

  get incapacidad_laboral(): FormArray {
    return this.formActualizarNomina.get('incapacidad_laboral') as FormArray;
  }

  get bonificaciones(): FormArray {
    return this.formActualizarNomina.get('bonificaciones') as FormArray;
  }

  get ayudas(): FormArray {
    return this.formActualizarNomina.get('ayudas') as FormArray;
  }

  get otros_conceptos(): FormArray {
    return this.formActualizarNomina.get('otros_conceptos') as FormArray;
  }

  get compensaciones_oe(): FormArray {
    return this.formActualizarNomina.get('compensaciones_oe') as FormArray;
  }

  get bonificaciones_epctv(): FormArray {
    return this.formActualizarNomina.get('bonificaciones_epctv') as FormArray;
  }

  get comisiones_devengado(): FormArray {
    return this.formActualizarNomina.get('comisiones_devengado') as FormArray;
  }

  get anticipos_devengados(): FormArray {
    return this.formActualizarNomina.get('anticipos_devengados') as FormArray;
  }

  get pagao_tercero_devengado(): FormArray {
    return this.formActualizarNomina.get(
      'pagao_tercero_devengado'
    ) as FormArray;
  }

  get salud(): FormGroup {
    return this.formActualizarNomina.get(
      'salud'
    ) as FormGroup;
  }

  get pension(): FormGroup {
    return this.formActualizarNomina.get(
      'pension'
    ) as FormGroup;
  }

  get sindicato(): FormArray {
    return this.formActualizarNomina.get(
      'sindicato'
    ) as FormArray;
  }

  get sanciones(): FormArray {
    return this.formActualizarNomina.get(
      'sanciones'
    ) as FormArray;
  }

  get libranza(): FormArray {
    return this.formActualizarNomina.get(
      'libranza'
    ) as FormArray;
  }

  get pagao_tercero_deducciones(): FormArray {
    return this.formActualizarNomina.get(
      'pagao_tercero_deducciones'
    ) as FormArray;
  }

  get anticipos_deducciones(): FormArray {
    return this.formActualizarNomina.get(
      'anticipos_deducciones'
    ) as FormArray;
  }

  get otras_deducciones(): FormArray {
    return this.formActualizarNomina.get(
      'otras_deducciones'
    ) as FormArray;
  }

  changeFechaRetiro() {
    this.formActualizarNomina
      .get('has_fecha_retiro')
      .reset(!this.formActualizarNomina.value.has_fecha_retiro);
  }

  formatearNumberNoDecimal(valor) {
    return this.funcionesService.formatNumberOnlyNoDecimal(valor);
  }

  valor_pagar_formgroup(event, form: FormGroup, field) {
    let val = event.replaceAll(',', '');

    if (this.funcionesService.countDecimalPoints(val) === 0) {
      let val2 = this.formatearNumber(val);
      let arr = val2.split('.');
      if (arr.length > 1) {
        val = arr[0];
      } else {
        val = val2;
      }
      form.get(field)!.setValue(val);
    } else {
      form.get(field)!.setValue(this.formatearNumberNoDecimal(val));
    }

    this.calculateTotal();
  }

  valor_pagar(event, form: FormArray, i, field) {
    let val = event.replaceAll(',', '');

    if (this.funcionesService.countDecimalPoints(val) === 0) {
      let val2 = this.formatearNumber(val);
      let arr = val2.split('.');
      if (arr.length > 1) {
        val = arr[0];
      } else {
        val = val2;
      }
      form.get([i]).get(field)!.setValue(val);
    } else {
      form.get([i]).get(field)!.setValue(this.formatearNumberNoDecimal(val));
    }

    this.calculateTotal();
  }

  calcular_input(event, form: FormArray, i, field) {
    this.valor_pagar(event, form, i, field);

    let valor_pagado = ((form.get([i]).get('valor_pagado').value ?? 0)+"").replaceAll(",", "") ?? "0";
    let cantidad_dias = ((form.get([i]).get('cantidad_dias').value ?? 0)+"").replaceAll(",", "") ?? "0";
    let porcentaje = ((form.get([i]).get('porcentaje').value ?? 0)+"").replaceAll(",", "") ?? "0";

    if (valor_pagado == "0" || cantidad_dias == "0" || porcentaje == "0") {
      form.get([i]).get('pago_interes').reset(0)
      return;
    }
    
    /*
    Para calcular los intereses de las cesantías se utiliza la fórmula: Cesantías x Días trabajados x 0,12 ÷ 360
    */
    let pago_interes = ((+valor_pagado) * (+cantidad_dias) * ((+porcentaje) / 100) / 360)+"";
    form.get([i]).get('pago_interes').reset(this.formatearNumber(pago_interes))

    if (this.funcionesService.countDecimalPoints(pago_interes) === 0) {
      let pago_interes2 = this.formatearNumber(pago_interes);
      let arr = pago_interes2.split('.');
      if (arr.length > 1) {
        pago_interes = arr[0];
      } else {
        pago_interes = pago_interes2;
      }
      form.get([i]).get('pago_interes').reset(pago_interes);
    } else {
      form.get([i]).get('pago_interes').setValue(this.formatearNumberNoDecimal(pago_interes));
    }

    this.calculateTotal();
    
  }

  calcular_inputSindicato(event, form: FormArray, i, field) {
    this.valor_pagar(event, form, i, field);

    let porcentaje = ((form.get([i]).get('porcentaje').value ?? 0)+"").replaceAll(",", "") ?? "0";

    if (porcentaje == "0") {
      form.get([i]).get('valor').reset(0)
      return;
    }
   
    let salario = +((this.formActualizarNomina.get('salario').value+"").replaceAll(",", ""));

    let salarioText = (salario*((+porcentaje)/100))+"";

    form.get([i]).get('valor').reset(this.formatearNumber(salarioText))

    this.calculateTotal();
    
  }

  changeSalario(event, field) {
    this.valor_pagar_form(event, field);
    this.recalcular();
    this.originSalary = +((this.formActualizarNomina.get('salario').value+"").replaceAll(",", ""));
  }

  valor_pagar_form(event, field) {
    let val = event.replaceAll(',', '');

    if (this.funcionesService.countDecimalPoints(val) === 0) {
      let val2 = this.formatearNumber(val);
      let arr = val2.split('.');
      if (arr.length > 1) {
        val = arr[0];
      } else {
        val = val2;
      }
      this.formActualizarNomina.get(field)!.setValue(val);
    } else {
      this.formActualizarNomina.get(field)!.setValue(this.formatearNumberNoDecimal(val));
    }

    this.recalcular();
  }


  getFormattedDate(fecha: string): string | null {
    // Formatear la fecha usando DatePipe
    return this.datePipe.transform(fecha, 'yyyy-MM-dd');
  }

  downloadFile(factura_id, file, codigo_factura) {
    this.historialVentaService
      .downloadInvoiceFile(factura_id, file, 3)
      .subscribe(
        (data: Blob) => {
          const blob = new Blob([data], { type: 'application/' + file });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = codigo_factura + '.' + file;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        },
        (error) => {
          console.error('Error downloading: ' + file, error);
        }
      );
  }

  pageClicked = 0;
  getHistorial(): void {
    this.getService();
  }

  counter(i: number) {
    return new Array(i);
  }

  llamar() {
    //this.loaded = false;
    this.getHistorial();
  }

  botones(active) {
    if (active) {
      return 'page-item active';
    } else {
      return 'page-item';
    }
  }

  next() {
    this.pages.subscribe((resp) => {
      if (this.page < resp.length) {
        this.getHistorial();
      }
    });
  }

  before() {
    if (this.page > 1) {
      this.getHistorial();
    }
  }

  buscar() {
    clearTimeout(this.timeClear);

    this.timeClear = setTimeout(() => {
      this.getHistorial();
    }, 360);
  }

  cleanData1() {
    this.formAnular.reset({
      motivo: '',
    });
  }

  cleanData2() {
    this.formDevolver.patchValue({
      factura: '',
      metodo_pago: null,
    });
    this.prds.clear();
  }

  cleanData3() {
    this.formNominaElectronica.reset({
      empleado: [null, []],
      nomina: [this.nominaId],
    });
  }

  closeModal3() {
    this.childModal3?.hide();
  }

  closeModal4() {
    this.childModal4?.hide();
  }

  closeModalNominasAjuste() {
    this.childModalNominasAjuste?.hide();
  }

  onSuccess(title: string, mensaje: string, tipo: TypeAlert): void {
    if (tipo == TypeAlert.success) {
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: title,
        text: '' + mensaje + ' !',
        showConfirmButton: false,
        timer: 2000,
      });
    } else {
      Swal.fire({
        title: title,
        text: '' + mensaje + '!',
        icon: 'info',
        iconColor: '#145388',
        confirmButtonColor: '#145388',
      });
    }
  }

  /* Para poner la fecha actual */
  fechaActual() {
    let date = new Date();
    let day = `${date.getDate()}`.padStart(2, '0');
    let month = `${date.getMonth() + 1}`.padStart(2, '0');
    let year = date.getFullYear();

    var fecha_inicial = `${year}-${month}-${day}`;
    var fecha_final = `${year}-${month}-${day}`;

    this.fechaInicial = fecha_inicial;
    this.fechaFinal = fecha_final;
    this.horaInicial = `00:00`;
    this.horaFinal = `23:59`;
  }

    convertirNumerosConComas(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(item => this.convertirNumerosConComas(item));
    } else if (obj !== null && typeof obj === 'object') {
      const nuevoObj: any = {};
      for (const [key, value] of Object.entries(obj)) {
        nuevoObj[key] = this.convertirNumerosConComas(value);
      }
      return nuevoObj;
    } else if (typeof obj === 'string' && /^\d{1,3}(,\d{3})*(\.\d+)?$/.test(obj)) {
      return parseFloat(obj.replace(/,/g, ''));
    } else {
      return obj;
    }
  }

  unirLicenciasConTipo(data: any): any[] {
    const maternidad = (data.licencias_maternidad || []).map((l: any) => ({
      ...l,
      tipo: 1
    }));
  
    const remuneradas = (data.licencias_remuneradas || []).map((l: any) => ({
      ...l,
      tipo: 2
    }));
  
    const noRemuneradas = (data.licencias_no_remuneradas || []).map((l: any) => ({
      ...l,
      tipo: 3
    }));
  
    return [...maternidad, ...remuneradas, ...noRemuneradas];
  }

  goBack() {
    this._location.back();
  }

   openPdfInNewTab(id = null, is_nomina_ajuste = 'NO'): void {
      Swal.fire({
        title: 'Cargando PDF...', 
        didOpen: () => {
          Swal.showLoading();
        },
        allowOutsideClick: false,
        allowEscapeKey: false,   
        showConfirmButton: false 
        }
      );
  
      this.nominaElectronicaService.getNominaElectronicaPdf(
        this.nominaId,
        this.nominaEmpleadoId,
        this.empleadoId,
        id,
        is_nomina_ajuste
      )
        .subscribe({
          next: (pdfBlob: Blob) => {
            Swal.close();
            const blobUrl = URL.createObjectURL(pdfBlob);
            window.open(blobUrl, '_blank');
          },
          error: (error) => {
            Swal.close();
            Swal.fire({
              title: 'Error al cargar el PDF',
              text: 'No se pudo cargar el PDF de la nómina electrónica. Por favor, inténtalo de nuevo.',
              icon: 'error', 
              confirmButtonColor: '#145388',
            });
          }
        });
    }

    isObject(object: any): boolean {
      return object != null && typeof object === 'object';
    }

  
    arreglosIdenticos(object1: any, object2: any): boolean {
      const keys1 = Object.keys(object1);
      const keys2 = Object.keys(object2);

      if (keys1.length !== keys2.length) {
        return false;
      }

      for (const key of keys1) {
        const val1 = object1[key];
        const val2 = object2[key];

        const areObjects = this.isObject(val1) && this.isObject(val2);
        if (areObjects && !this.arreglosIdenticos(val1, val2) || !areObjects && val1 !== val2) {
          return false;
        }
      }

      return true;
    }

  sendNominaElectronica() {
    this.disabledEnviando = true;  

    let formNomina = this.formActualizarNomina.value;


    if (! this.arreglosIdenticos(formNomina, this.formObjInicial)) {
      this.onSuccess(
        'Nómina no enviada', 
        'Para enviar la nómina electrónica, primero debe guardar los cambios realizados.',
        TypeAlert.warning
      );
      this.disabledEnviando = false;
      return;
    }
    

    Swal.fire({
      title: 'Enviando nómina del empleado...',
      didOpen: () => {
        Swal.showLoading();
      },
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false
    });

    this.nominaElectronicaService
    .sendNominaElectronica(
      this.nominaId,
        this.nominaEmpleadoId,
        this.empleadoId
    )
    .subscribe(
      (resp) => {
        Swal.close();
        this.onSuccess(
          'Nómina enviada con éxito',
          resp.message,
          TypeAlert.success
        );
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      },
      (error) => {
        Swal.close();
        this.onSuccess(
          'Ocurrió un error!',
          error.error.message,
          TypeAlert.warning
        );
        this.disabledEnviando = false;
      }
    );

  }

  onSubmit() {
    this.disabled = true;

    const datosProcesados = this.convertirNumerosConComas(this.formActualizarNomina.value);

    datosProcesados['licencias'] = this.unirLicenciasConTipo(datosProcesados);
    
    Swal.fire({
      title: 'Guardando...',
      didOpen: () => {
        Swal.showLoading();
      },
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false
    });

    this.nominaElectronicaService
      .guardarNominaEmpleado(datosProcesados)
      .subscribe(
        (resp) => {
          Swal.close();
          this.onSuccess(
            'Nómina actualizada con éxito',
            resp.message,
            TypeAlert.success
          );
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        },
        (error) => {
          Swal.close();
          this.onSuccess(
            'Ocurrió un error!',
            error.error.message,
            TypeAlert.warning
          );
          this.disabled = false;
        }
      );
  }

  devolver() {
    this.disabled = true;
    this.hasDevolucion = false;
    let mayor = false;
    let menor = false;

    this.prds.controls.forEach((element, index) => {
      if (element.get('cantidad_devolver').value) {
        this.hasDevolucion = true;
      }

      if (
        element.get('cantidad_devolver').value >
        this.dataProductosFactura[index].cantidad -
          this.dataProductosFactura[index].devolucion
      ) {
        mayor = true;
      }

      if (
        element.get('cantidad_devolver').value &&
        element.get('cantidad_devolver').value < 1
      ) {
        menor = true;
      }
    });

    if (!this.hasDevolucion) {
      this.onSuccess(
        'Debe ingresar por lo menos una devolución',
        'Diligencie por lo menos una devolución a una factura para poder realizar la acción de devolver...',
        TypeAlert.warning
      );
      this.disabled = false;
      return;
    }

    if (mayor) {
      this.onSuccess(
        'Error en la cantidad a devolver',
        'Verifique las cantidades a devolver, estas no pueden exceder las unidades restantes...',
        TypeAlert.warning
      );
      this.disabled = false;
      return;
    }

    if (menor) {
      this.onSuccess(
        'Error en la cantidad a devolver',
        'Verifique las cantidades a devolver, estas no pueden ser menores a 1...',
        TypeAlert.warning
      );
      this.disabled = false;
      return;
    }

    this.historialVentaService
      .devolucionFacturaVenta(
        this.formDevolver.value,
        this.formDevolver.get('metodo_pago').value,
        this._dataFactura.id
      )
      .subscribe(
        (_) => {
          this.onSuccess(
            'Productos devueltos',
            'Se ha realizado las devoluciones de los productos con éxito',
            TypeAlert.success
          );
          this.router.navigate(['/informe', 'devoluciones']);
          // this.getHistorial(1, 1);
          this.disabled = false;
        },
        (_) => {
          this.onSuccess(
            'Error al devolver los productos!',
            'Ocurrió un error',
            TypeAlert.warning
          );
          this.disabled = false;
        }
      );
  }

  observacion() {
    this.disabled = true;

    this.nominaElectronicaService
      .agregarEmpleadoNomina(this.formNominaElectronica.value)
      .subscribe(
        (_) => {
          this.onSuccess(
            'Empleado agregado a la nómina',
            'Se agregó el empleado con éxito',
            TypeAlert.success
          );
          this.getHistorial();
          this.disabled = false;
        },
        (error) => {
          this.onSuccess(
            'Ocurrió un error!',
            error.error.message,
            TypeAlert.warning
          );
          this.disabled = false;
        }
      );
    this.closeModal3();
  }

  openModal(item, accion: number) {

    this._dataFactura = item;

    this.childModal3?.show();
  }

  openModalDeducciones() {
    this.childModal4?.show();
  }

  openModalNominasAjuste() {
    this.getNominasAjustes();
    this.childModalNominasAjuste?.show();
  }

  getColorState(estado: number) {
    return this.funcionesService.getColorState(estado);
  }

  imprimirTicket(item) {
    this.showTicket = true;
    this.idInvoice = item.id;
  }

  closeTicket(value: string) {
    this.showTicket = false;
  }

  imprimirTicketCarta(item) {
    this.showTicketVentaCarta = true;
    this.idInvoice = item.id;
  }

  closeTicketCarta(value: string) {
    this.showTicketVentaCarta = false;
  }

  ///gestiono el reenvio de la factura electronica cuando la DIAN EST EN MANTENIMIENTO
  electronicInvoiceDian() {
    this.disabledEnvioDian = true;

    this.historialVentaService.reenviarFacturaDian(this.idInvoice).subscribe(
      (resp) => {
        this.funcionService.onSuccess(resp.message, 'success', '¡OK!');
        ///en el caso que sea exitoso el envio, refrescamos la tabla
        this.getHistorial();

        this.disabledEnvioDian = false;
      },
      (error) => {
        this.disabledEnvioDian = false;
        this.funcionService.onSuccess(
          error.error.data,
          'error',
          error.error.message
        );
      }
    );
  }

  /**
   * INPUTS DE HORAS EXTRAS
   */
  changeHoraExtra(checkboxField, form: FormArray, porcentaje) {
    let checked = this.formDevengadosCheckbox.get(checkboxField).value;
    if (checked) {
      this.addHoraExtra(form, porcentaje);
    } else {
      form.clear();
    }

    this.recalcularHoraExtraDiurna();

    // Hora Extra Nocturna 
    this.recalcularHoraExtraNocturna();

    // Hora_Recargo_Nocturno
    this.recalcular_Hora_Recargo_Nocturno();
    
    // Hora_Extra_Diurna_Dominical_y_Festivos
    this.recalcular_Hora_Extra_Diurna_Dominical_y_Festivos();
   
    // Hora_Recargo_Diurno_Dominical_y_Festivos
    this.recalcular_Hora_Recargo_Diurno_Dominical_y_Festivos();

    // Hora_Extra_Nocturna_Dominical_y_Festivos 
    this.recalcular_Hora_Extra_Nocturna_Dominical_y_Festivos();
    
    // Hora_Recargo_Nocturno_Dominical_y_Festivos 
    this.recalcular_Hora_Recargo_Nocturno_Dominical_y_Festivos();

    console.log('abcddd')

    this.calculateTotal();
  }

  changeVacaciones(checkboxField, form: FormArray, dias = 'dias') {
    let checked = this.formDevengadosCheckbox.get(checkboxField).value;
    if (checked) {
      this.addVacaciones(form, dias);
    } else {
      form.clear();
    }

    this.recalcular();
  }

  changeNoRemuneradas(checkboxField, form: FormArray, dias = 'dias') {
    let checked = this.formDevengadosCheckbox.get(checkboxField).value;
    if (checked) {
      this.addNoRemuneradas(form, dias);
    } else {
      form.clear();
    }

    this.recalcular();
  }

  changeOtrosConceptos(checkboxField, form: FormArray) {
    let checked = this.formDevengadosCheckbox.get(checkboxField).value;
    if (checked) {
      this.addOtrosConceptos(form);
    } else {
      form.clear();
    }

    this.recalcular();
  }

  changeCompensacionesOE(checkboxField, form: FormArray) {
    let checked = this.formDevengadosCheckbox.get(checkboxField).value;
    if (checked) {
      this.addCompesancionesOE(form);
    } else {
      form.clear();
    }

    this.recalcular();
  }

  changeBonificacionesEpctv(checkboxField, form: FormArray) {
    let checked = this.formDevengadosCheckbox.get(checkboxField).value;
    if (checked) {
      this.addBonificacionesEpctv(form);
    } else {
      form.clear();
    }
    this.recalcular();
  }

  changeComisionesDevengado(checkboxField, form: FormArray, tipo) {
    let checked = this.formDevengadosCheckbox.get(checkboxField).value;
    if (checked) {
      this.addComisionesDevengado(form, tipo);
    } else {
      form.clear();
    }
    this.recalcular();
  }

  changePrimas(checkboxField, form: FormArray) {
    let checked = this.formDevengadosCheckbox.get(checkboxField).value;
    if (checked) {
      this.addPrimas(form);
    } else {
      form.clear();
    }
    this.recalcular();
  }

  changeBonificaciones(checkboxField, form: FormArray, tipo) {
    let checked = this.formDevengadosCheckbox.get(checkboxField).value;
    if (checked) {
      this.addBonificaciones(form, tipo);
    } else {
      form.clear();
    }
    this.recalcular();
  }

  changeCesantias(checkboxField, form: FormArray) {
    let checked = this.formDevengadosCheckbox.get(checkboxField).value;
    if (checked) {
      this.addCesantias(form);
    } else {
      form.clear();
    }
    this.recalcular();
  }

  changeIncapacidadLaboral(checkboxField, form: FormArray) {
    let checked = this.formDevengadosCheckbox.get(checkboxField).value;
    if (checked) {
      this.addIncapacidadLaboral(form);
    } else {
      form.clear();
    }
    this.recalcular();
  }

  changeInput(form: FormGroup, fieldForm: string) {
    form.get(fieldForm).reset(0);
    this.recalcular();
  }

  formHoraExtra(porcentaje) {
    return this.formBuilder.group({
      fecha_inicio: [],
      fecha_fin: [],
      cantidad_horas: [],
      porcentaje: [porcentaje],
      pago: [],
    });
  }

  changeDeducciones(formGroup: FormGroup, checkboxField, form: FormArray) {
    let checked = formGroup.get(checkboxField).value;
    if (checked) {
      let formItem: FormGroup;
      switch (checkboxField) {
        case 'sindicato':
          formItem = this.buildSindicato();
          this.appendItemDeducciones(this.sindicato, formItem);
          break;
        case 'sanciones':
          formItem = this.buildSanciones();
          this.appendItemDeducciones(this.sanciones, formItem);
          break;
        case 'libranza':
          formItem = this.buildLibranza();
          this.appendItemDeducciones(this.libranza, formItem);
          break;
        case 'pagao_tercero_deducciones':
          formItem = this.buildPagoTerceroDeducciones();
          this.appendItemDeducciones(this.pagao_tercero_deducciones, formItem);
          break;
        case 'anticipos_deducciones':
          formItem = this.buildAnticiposDeducciones();
          this.appendItemDeducciones(this.anticipos_deducciones, formItem);
          break;
        case 'otras_deducciones':
          formItem = this.buildOtrasDeducciones();
          this.appendItemDeducciones(this.otras_deducciones, formItem);
          break;
  

          
      }
    } else {
      form.clear();
    }

    this.recalcular();
  }

  deleteItemDeducciones(formGroup: FormGroup, fieldForm, form: FormArray, i) {
    form.removeAt(i);
    if (form.controls.length == 0) {
      formGroup.get(fieldForm).reset(false);
    }

    this.calculateTotal();
  }

  buildSindicato(data = null): FormGroup {
    if (data != null) {
      return this.formBuilder.group({
        porcentaje: data.porcentaje,
        valor: this.formatearNumber(data.valor)
      });
    } else {
      return this.formBuilder.group({
        porcentaje: [],
        valor: []
      });
    }
  }

  buildSanciones(data = null): FormGroup {
    if (data != null) {
      return this.formBuilder.group({
        valor_sancion_publica: this.formatearNumber(data.valor_sancion_publica),
        valor_sancion_privada: this.formatearNumber(data.valor_sancion_privada)
      });
    } else {
      return this.formBuilder.group({
        valor_sancion_publica: [],
        valor_sancion_privada: []
      });
    }
  }

  buildLibranza(data = null): FormGroup {
    if (data != null) {
      return this.formBuilder.group({
        valor: this.formatearNumber(data.valor),
        descripcion: data.descripcion
      });
    } else {
      return this.formBuilder.group({
        valor: [],
        descripcion: []
      });
    }
  }

  buildPagoTerceroDeducciones(data = null): FormGroup {
    if (data != null) {
      return this.formBuilder.group({
        valor: this.formatearNumber(data.valor),
        tipo: 4
      });
    } else {
      return this.formBuilder.group({
        valor: [],
        tipo: 4
      });
    }
  }

  buildAnticiposDeducciones(data = null): FormGroup {
    if (data != null) {
      return this.formBuilder.group({
        valor: this.formatearNumber(data.valor),
        tipo: 5
      });
    } else {
      return this.formBuilder.group({
        valor: [],
        tipo: 5
      });
    }
  }

  buildOtrasDeducciones(data = null): FormGroup {
    if (data != null) {
      return this.formBuilder.group({
        valor: this.formatearNumber(data.valor),
        tipo: 6
      });
    } else {
      return this.formBuilder.group({
        valor: [],
        tipo: 6
      });
    }
  }

  appendItemDeducciones(form: FormArray, buildItem: FormGroup) {
    form.push(buildItem)
  }


  addHoraExtra(form: FormArray, porcentaje) {
    form.push(this.formHoraExtra(porcentaje));
  }

  deleteHoraExtra(i, form: FormArray, fieldForm) {
    form.removeAt(i);
    if (form.controls.length == 0) {
      this.formDevengadosCheckbox.get(fieldForm).reset(false);
    }

    this.calculateTotal();
  }

  addVacaciones(form: FormArray, dias = 'dias') {
    if (dias == 'dias') {
      form.push(
        this.formBuilder.group({
          fecha_inicio: [],
          fecha_fin: [],
          dias: [],
          pago: [],
        })
      );
    } else {
      form.push(
        this.formBuilder.group({
          fecha_inicio: [],
          fecha_fin: [],
          cantidad_dias: [],
          pago: [],
        })
      );
    }
  }

   addNoRemuneradas(form: FormArray, dias = 'dias') {
    if (dias == 'dias') {
      form.push(
        this.formBuilder.group({
          fecha_inicio: [],
          fecha_fin: [],
          dias: [],
          pago: 0,
        })
      );
    } else {
      form.push(
        this.formBuilder.group({
          fecha_inicio: [],
          fecha_fin: [],
          cantidad_dias: [],
          pago: 0,
        })
      );
    }
  }

  addPrimas(form: FormArray, data = null) {
    if (data != null) {
      form.push(
        this.formBuilder.group({
          valor_pagado_prima_legal: [this.formatearNumber(+data.valor_pagado_prima_legal)],
          pago_no_salarial: [this.formatearNumber(+data.pago_no_salarial)],
          cantidad_dias: [this.formatearNumber(+data.cantidad_dias)],
        })
      );
    } else {
      form.push(
        this.formBuilder.group({
          valor_pagado_prima_legal: [],
          pago_no_salarial: [],
          cantidad_dias: [],
        })
      );
    }
  }

  addBonificaciones(form: FormArray, tipo, data = null) {
    if (data != null) {
      form.push(
        this.formBuilder.group({
          salarial: [this.formatearNumber(+data.salarial)],
          no_salarial: [this.formatearNumber(+data.no_salarial)],
          tipo: data.tipo,
        })
      );
    } else {
      form.push(
        this.formBuilder.group({
          salarial: [],
          no_salarial: [],
          tipo: tipo,
        })
      );
    }
  }

  addCesantias(form: FormArray, data = null) {
    if (data != null) {
      form.push(
        this.formBuilder.group({
          valor_pagado: [this.formatearNumber(+data.valor_pagado)],
          cantidad_dias: [+data.cantidad_dias],
          porcentaje: [+data.porcentaje],
          pago_interes: [this.formatearNumber(+data.pago_interes)],
        })
      );
    } else {
      form.push(
        this.formBuilder.group({
          valor_pagado: [],
          cantidad_dias: 360,
          porcentaje: [],
          pago_interes: [],
        })
      );
    }
  }

  addIncapacidadLaboral(form: FormArray, data = null) {
    if (data != null) {
      form.push(
        this.formBuilder.group({
          fecha_inicio: [data.fecha_inicio],
          fecha_fin: [data.fecha_fin],
          cantidad_dias: [+data.cantidad_dias],
          pago: [this.formatearNumber(+data.pago)],
          tipo: [data.tipo],
        })
      );
    } else {
      form.push(
        this.formBuilder.group({
          fecha_inicio: [],
          fecha_fin: [],
          cantidad_dias: [],
          pago: [],
          tipo: 1,
        })
      ); 
    }
  }

  addOtrosConceptos(form: FormArray, data = null) {
    if (data != null) {
      form.push(
        this.formBuilder.group({
          pago_salarial: [this.formatearNumber(+data.pago_salarial)],
          pago_no_salarial: [this.formatearNumber(+data.pago_no_salarial)],
          descripcion: [data.descripcion],
        })
      );
    } else {
      form.push(
        this.formBuilder.group({
          pago_salarial: [],
          pago_no_salarial: [],
          descripcion: [],
        })
      );
    }
  }

  addCompesancionesOE(form: FormArray, data = null) {
    if (data != null) {
      form.push(
        this.formBuilder.group({
          ordinaria: [this.formatearNumber(+data.ordinaria)],
          extraordinaria: [this.formatearNumber(+data.extraordinaria)],
        })
      );
    } else {
      form.push(
        this.formBuilder.group({
          ordinaria: [],
          extraordinaria: [],
        })
      );
    }
  }

  addBonificacionesEpctv(form: FormArray, data = null) {
    if (data != null) {
      form.push(
        this.formBuilder.group({
          pago_salarial: [this.formatearNumber(+data.pago_salarial)],
          pago_no_salarial: [this.formatearNumber(+data.pago_no_salarial)],
          pago_alimentacion_salarial: [this.formatearNumber(+data.pago_alimentacion_salarial)],
          pago_alimentacion_no_salarial: [this.formatearNumber(+data.pago_alimentacion_no_salarial)],
        })
      );
    } else {
      form.push(
        this.formBuilder.group({
          pago_salarial: [],
          pago_no_salarial: [],
          pago_alimentacion_salarial: [],
          pago_alimentacion_no_salarial: [],
        })
      );
    }
  }

  addComisionesDevengado(form: FormArray, tipo, data = null) {
    if (data != null) {
      form.push(
        this.formBuilder.group({
          valor: [this.formatearNumber(+data.valor)],
          tipo: data.tipo,
        })
      );
    } else {
      form.push(
        this.formBuilder.group({
          valor: [],
          tipo: tipo,
        })
      );
    }
  }

  changeTipoSalud(value) {
    let porcentaje_salud_empleado = null;
    let porcentaje_salud_empleador = null;
    switch (value) {
      case "1":
        porcentaje_salud_empleado = 4.00;
        porcentaje_salud_empleador = 8.5;
        break;
      case "2":
        porcentaje_salud_empleado = 8.50;
        porcentaje_salud_empleador = 4.00;
        break;
      case "3":
        porcentaje_salud_empleado = 4.00;
        porcentaje_salud_empleador = 0.00;
        break;
      case "4":
        porcentaje_salud_empleado = 0.00;
        porcentaje_salud_empleador = 4.00;
        break;
    }
    this.salud.get('porcentaje_salud_empleado').reset(porcentaje_salud_empleado);
    this.salud.get('porcentaje_salud_empleador').reset(porcentaje_salud_empleador);

    let salario = +((this.formActualizarNomina.get('salario').value+"").replaceAll(",", ""));

    let salarioText = (salario*(porcentaje_salud_empleado/100))+"";
    let salarioEmpleadorText = (salario*(porcentaje_salud_empleador/100))+"";

    this.valor_pagar_formgroup(salarioText, this.salud, 'aporte_salud_empleado');
    this.valor_pagar_formgroup(salarioEmpleadorText, this.salud, 'aporte_salud_empleador');

    this.calculateTotal();
  }

  changeTipoPension(value) {
    let porcentaje_pension_empleado = null;
    let porcentaje_pension_empleador = null;
    switch (value) {
      case "5":
        porcentaje_pension_empleado = 4.00;
        porcentaje_pension_empleador = 12.00;
        break;
      case "6":
        porcentaje_pension_empleado = 12.00;
        porcentaje_pension_empleador = 4.00;
        break;
      case "7":
        porcentaje_pension_empleado = 4.00;
        porcentaje_pension_empleador = 22.00;
        break;
      case "8":
        porcentaje_pension_empleado = 22.00;
        porcentaje_pension_empleador = 4.00;
        break;
    }
    this.pension.get('porcentaje_pension_empleado').reset(porcentaje_pension_empleado);
    this.pension.get('porcentaje_pension_empleador').reset(porcentaje_pension_empleador);

    let salario = +((this.formActualizarNomina.get('salario').value+"").replaceAll(",", ""));

    let salarioText = (salario*(porcentaje_pension_empleado/100))+"";
    let salarioEmpleadorText = (salario*(porcentaje_pension_empleador/100))+"";

    this.valor_pagar_formgroup(salarioText, this.pension, 'aporte_pension_empleado');
    this.valor_pagar_formgroup(salarioEmpleadorText, this.pension, 'aporte_pension_empleador');

    this.calculateTotal();
  }

  change_fondo_seguridad_pensional() {
    let checked = this.pension.get('fondo_seguridad_pensional').value;
    this.pension.get('tipo_seguridad_pensional').reset("null");
    this.pension.get('porcentaje_seguridad_pensional').reset(null);
    this.pension.get('valor_seguridad_pensional').reset(null);
    this.pension.get('tipo_fondo_subsistencia_pensional').reset("null");
    this.pension.get('porcentaje_fondo_subsistencia_pensional').reset(null);
    this.pension.get('valor_fondo_subsistencia_pensional').reset(null);

    this.calculateTotal();
  }

  changeFondoSeguridad(value, fieldTipo, fieldPorcentaje, fieldValor) {
    if (value != "null") {

      let salario = +((this.formActualizarNomina.get('salario').value+"").replaceAll(",", ""));

      this.pension.get(fieldPorcentaje).reset(1);

      let salarioText = (salario*(1/100))+"";
      
      this.pension.get(fieldValor).reset(salarioText);

    } else {

      this.pension.get(fieldPorcentaje).reset(0);
      
      this.pension.get(fieldValor).reset(0);

    }

    this.calculateTotal();
  }

  recalcularHoraExtraDiurna() {
    for (let i = 0; i < this.hora_extra_diurna.controls.length; i++) {
      this.calculateHour(
        i,
        true,
        this.hora_extra_diurna,
        this.porcentajeHoraExtraDiurna
      );
    }
  }

  recalcularHoraExtraNocturna() {
    for (let i = 0; i < this.hora_extra_nocturna.controls.length; i++) {
      this.calculateHour(
        i,
        true,
        this.hora_extra_nocturna,
        this.porcentajeHoraExtraNocturna
      );
    }
  }

  recalcular_Hora_Recargo_Nocturno() {
  for (let i = 0; i < this.hora_recargo_nocturno.controls.length; i++) {
      this.calculateHour(
        i,
        true,
        this.hora_recargo_nocturno,
        this.porcentajeHoraRecargoNocturno
      );
    }
  }

  recalcular_Hora_Extra_Diurna_Dominical_y_Festivos() {
 for (
      let i = 0;
      i < this.hora_extra_diurna_dominical_festivos.controls.length;
      i++
    ) {
      this.calculateHour(
        i,
        true,
        this.hora_extra_diurna_dominical_festivos,
        this.porcentajeHoraExtraDiurnaFestivos
      );
    }
  }

  recalcular_Hora_Recargo_Diurno_Dominical_y_Festivos() {
    for (
      let i = 0;
      i < this.hora_recargo_diurno_dominical_festivos.controls.length;
      i++
    ) {
      this.calculateHour(
        i,
        true,
        this.hora_recargo_diurno_dominical_festivos,
        this.porcentajeHoraRecargoDiurnoFestivos
      );
    }
  }

  recalcular_Hora_Extra_Nocturna_Dominical_y_Festivos() {
for (
      let i = 0;
      i < this.hora_extra_nocturna_dominical_festivos.controls.length;
      i++
    ) {
      this.calculateHour(
        i,
        true,
        this.hora_extra_nocturna_dominical_festivos,
        this.porcentajeHoraExtraNocturnaFestivos
      );
    }
  }

  recalcular_Hora_Recargo_Nocturno_Dominical_y_Festivos() {
     for (
      let i = 0;
      i < this.hora_recargo_nocturno_dominical_festivos.controls.length;
      i++
    ) {
      this.calculateHour(
        i,
        true,
        this.hora_recargo_nocturno_dominical_festivos,
        this.porcentajeHoraRecargoNocturnoFestivos
      );
    }
  }

  recalcular_Sindicato() {
     for (
      let i = 0;
      i < this.sindicato.controls.length;
      i++
    ) {
      this.calcular_inputSindicato(this.sindicato.get([i]).get('porcentaje').value, this.sindicato, i, 'porcentaje');
    }
  }

  recalcular() {
    // Hora Extra Diurna
    this.recalcularHoraExtraDiurna();

    // Hora Extra Nocturna 
    this.recalcularHoraExtraNocturna();

    // Hora_Recargo_Nocturno
    this.recalcular_Hora_Recargo_Nocturno();
    
    // Hora_Extra_Diurna_Dominical_y_Festivos
    this.recalcular_Hora_Extra_Diurna_Dominical_y_Festivos();
   
    // Hora_Recargo_Diurno_Dominical_y_Festivos
    this.recalcular_Hora_Recargo_Diurno_Dominical_y_Festivos();

    // Hora_Extra_Nocturna_Dominical_y_Festivos 
    this.recalcular_Hora_Extra_Nocturna_Dominical_y_Festivos();
    
    // Hora_Recargo_Nocturno_Dominical_y_Festivos 
    this.recalcular_Hora_Recargo_Nocturno_Dominical_y_Festivos();

    let salario = +((this.formActualizarNomina.get('salario').value+"").replaceAll(",", ""));

    if (this.originSalary != salario) {
      // Salud
      this.changeTipoSalud(this.formActualizarNomina.value.salud.tipo_salud+"");

      // Pensión
      this.changeTipoPension(this.formActualizarNomina.value.pension.tipo_pension+"");
    }
    
    this.changeFondoSeguridad(this.formActualizarNomina.value.pension.tipo_seguridad_pensional, 'tipo_seguridad_pensional', 'porcentaje_seguridad_pensional', 'valor_seguridad_pensional')
    this.changeFondoSeguridad(this.formActualizarNomina.value.pension.tipo_fondo_subsistencia_pensional, 'tipo_fondo_subsistencia_pensional', 'porcentaje_fondo_subsistencia_pensional', 'valor_fondo_subsistencia_pensional');

    // Sindicato
   this.recalcular_Sindicato();

  }

  calculateTotal() {
    this.calcularTotalDevengado();

    this.calcularTotalDeducciones();

    console.log(this.formActualizarNomina.value)
    console.log(this.formActualizarNomina.get('totales').get('total_deducciones').value)

    let total_devengado = this.formActualizarNomina.get('totales').get('total_devengado').value;
    let total_deducciones = this.formActualizarNomina.get('totales').get('total_deducciones').value;

    let total = total_devengado - total_deducciones;
    this.formActualizarNomina.get('totales').get('total_salario_neto').reset(total);
  }

  calcularTotalDevengado() {
    let nominaData = this.formActualizarNomina.value;
  let totalDevengado = 0;

  // Función auxiliar para sumar los valores de un array de objetos
  const sumarValoresArray = (array: any[], campo: string) => {
    if (array && Array.isArray(array)) {
      array.forEach(item => {
        if (item && item[campo]) {
          totalDevengado += parseFloat((item[campo] + "").replaceAll(",", ""));
        }
      });
    }
  };

  // Horas Extras y Recargos
  // hora_extra_diurna
  sumarValoresArray(nominaData.hora_extra_diurna, 'pago');
  // hora_extra_nocturna
  sumarValoresArray(nominaData.hora_extra_nocturna, 'pago');
  // hora_recargo_nocturno
  sumarValoresArray(nominaData.hora_recargo_nocturno, 'pago');
  // hora_extra_diurna_dominical_festivos
  sumarValoresArray(nominaData.hora_extra_diurna_dominical_festivos, 'pago');
  // hora_recargo_diurno_dominical_festivos
  sumarValoresArray(nominaData.hora_recargo_diurno_dominical_festivos, 'pago');
  // hora_extra_nocturna_dominical_festivos
  sumarValoresArray(nominaData.hora_extra_nocturna_dominical_festivos, 'pago');
  // hora_recargo_nocturno_dominical_festivos    
  sumarValoresArray(nominaData.hora_recargo_nocturno_dominical_festivos, 'pago');

  // Otros devengados directos
  // subsidioTransporte
  totalDevengado += parseFloat((nominaData.subsidio_transporte + "").replaceAll(",", "")) || 0;
  // viaticosSalariales
  totalDevengado += parseFloat((nominaData.viatico_salarial + "").replaceAll(",", "")) || 0;
  // viaticosNoSalariales
  totalDevengado += parseFloat((nominaData.viatico_no_salarial + "").replaceAll(",", "")) || 0;
  // indemnizacion
  totalDevengado += parseFloat((nominaData.indemnizacion + "").replaceAll(",", "")) || 0;
  // reintegro
  totalDevengado += parseFloat((nominaData.reintegro_devengado + "").replaceAll(",", "")) || 0;
  // dotacion
  totalDevengado += parseFloat((nominaData.dotacion + "").replaceAll(",", "")) || 0;
  // teletrabajo
  totalDevengado += parseFloat((nominaData.teletrabajo + "").replaceAll(",", "")) || 0;
  // bono_retiro
  totalDevengado += parseFloat((nominaData.bono_retiro + "").replaceAll(",", "")) || 0;
  // apoyo_sostenible
  totalDevengado += parseFloat((nominaData.apoyo_sostenible + "").replaceAll(",", "")) || 0;

  // Vacaciones
  // vacaciones_comunes
  sumarValoresArray(nominaData.vacaciones_comunes, 'pago');
  // vacaciones_compensadas
  sumarValoresArray(nominaData.vacaciones_compensadas, 'pago');

  // Licencias
  // licencias_maternidad
  sumarValoresArray(nominaData.licencias_maternidad, 'pago');
  // licencias_remuneradas
  sumarValoresArray(nominaData.licencias_remuneradas, 'pago');
  // licencias_no_remuneradas
  // sumarValoresArray(nominaData.licencias_no_remuneradas, 'pago'); // Aunque diga no remuneradas, puede tener valor 0

  // Primas
  // primas
  if (nominaData.primas && Array.isArray(nominaData.primas)) {
    nominaData.primas.forEach(prima => {
      totalDevengado += parseFloat((prima.valor_pagado_prima_legal + "").replaceAll(",", "")) || 0;
      totalDevengado += parseFloat((prima.pago_no_salarial + "").replaceAll(",", "")) || 0;
    });
  }

  // Cesantías (solo el valor pagado, los intereses se suelen calcular aparte)
  // cesantias
  sumarValoresArray(nominaData.cesantias, 'valor_pagado');
  sumarValoresArray(nominaData.cesantias, 'pago_interes'); // Incluyendo los intereses de cesantías como devengado

  // Incapacidad Laboral
  // incapacidad_laboral
  sumarValoresArray(nominaData.incapacidad_laboral, 'pago');

  // Bonificaciones y Ayudas
  // bonificaciones
  if (nominaData.bonificaciones && Array.isArray(nominaData.bonificaciones)) {
    nominaData.bonificaciones.forEach(bonificacion => {
      totalDevengado += parseFloat((bonificacion.salarial + "").replaceAll(",", "")) || 0;
      totalDevengado += parseFloat((bonificacion.no_salarial + "").replaceAll(",", "")) || 0;
    });
  }

  // ayudas
  if (nominaData.ayudas && Array.isArray(nominaData.ayudas)) {
    nominaData.ayudas.forEach(ayuda => {
      totalDevengado += parseFloat((ayuda.salarial + "").replaceAll(",", "")) || 0;
      totalDevengado += parseFloat((ayuda.no_salarial + "").replaceAll(",", "")) || 0;
    });
  }

  // Huelga Legal (aunque el pago podría ser cero o un valor compensatorio)
  // huelga_legal
  sumarValoresArray(nominaData.huelga_legal, 'pago');

  // Otros Conceptos
  // otros_conceptos
  if (nominaData.otros_conceptos && Array.isArray(nominaData.otros_conceptos)) {
    nominaData.otros_conceptos.forEach(concepto => {
      totalDevengado += parseFloat((concepto.pago_salarial + "").replaceAll(",", "")) || 0;
      totalDevengado += parseFloat((concepto.pago_no_salarial + "").replaceAll(",", "")) || 0;
    });
  }

  // Compensaciones OE
  // compensaciones_oe
  if (nominaData.compensaciones_oe && Array.isArray(nominaData.compensaciones_oe)) {
    nominaData.compensaciones_oe.forEach(compensacion => {
      totalDevengado += parseFloat((compensacion.ordinaria + "").replaceAll(",", "")) || 0;
      totalDevengado += parseFloat((compensacion.extraordinaria + "").replaceAll(",", "")) || 0;
    });
  }

  // Bonificaciones EPCTV
  // bonificaciones_epctv
  if (nominaData.bonificaciones_epctv && Array.isArray(nominaData.bonificaciones_epctv)) {
    nominaData.bonificaciones_epctv.forEach(bonificacion => {
      totalDevengado += parseFloat((bonificacion.pago_salarial + "").replaceAll(",", "")) || 0;
      totalDevengado += parseFloat((bonificacion.pago_no_salarial + "").replaceAll(",", "")) || 0;
      totalDevengado += parseFloat((bonificacion.pago_alimentacion_salarial + "").replaceAll(",", "")) || 0;
      totalDevengado += parseFloat((bonificacion.pago_alimentacion_no_salarial + "").replaceAll(",", "")) || 0;
    });
  }

  // Pago a Tercero Devengado
  // pago_tercero_devengado
  sumarValoresArray(nominaData.pagao_tercero_devengado, 'valor');

  // Anticipos Devengados
  // anticipos_devengados
  sumarValoresArray(nominaData.anticipos_devengados, 'valor');
  
  // comisiones_devengado
  sumarValoresArray(nominaData.comisiones_devengado, 'valor');

  // Salario (se asume que el salario base también es parte del devengado)
  totalDevengado += parseFloat((nominaData.salario + "").replaceAll(",", "")) || 0;

  let total = parseFloat(totalDevengado.toFixed(2)); // Redondear a 2 decimales
  this.formActualizarNomina.get('totales').get('total_devengado').reset(total);

  console.log(total)
}

calcularTotalDeducciones() {
  let totalDeducciones = 0;

  let formDeduccionesCheckbox = this.formDeduccionesCheckbox.value;
  let nominaData = this.formActualizarNomina.value;
  // Función auxiliar para sumar los valores de un array de objetos
  const sumarValoresArrayDeducciones = (array: any[], campo: string) => {
    if (array && Array.isArray(array)) {
      array.forEach(item => {
        if (item && item[campo]) {
          totalDeducciones += parseFloat((item[campo] + "").replaceAll(",", ""));
        }
      });
    }
  };

  // Deducciones obligatorias (Salud y Pensión del empleado)
  totalDeducciones += parseFloat((nominaData.salud.aporte_salud_empleado + "").replaceAll(",", "")) || 0;
  totalDeducciones += parseFloat((nominaData.pension.aporte_pension_empleado + "").replaceAll(",", "")) || 0;
  totalDeducciones += parseFloat((nominaData.pension.valor_seguridad_pensional + "").replaceAll(",", "")) || 0;
  totalDeducciones += parseFloat((nominaData.pension.valor_fondo_subsistencia_pensional + "").replaceAll(",", "")) || 0;

  // Sindicato
  if (formDeduccionesCheckbox.sindicato) {
    sumarValoresArrayDeducciones(nominaData.sindicato, 'valor');
  }

  // Sanciones
  if (formDeduccionesCheckbox.sanciones) {
    if (nominaData.sanciones && Array.isArray(nominaData.sanciones)) {
      nominaData.sanciones.forEach(sancion => {
        totalDeducciones += parseFloat((sancion.valor_sancion_publica + "").replaceAll(",", "")) || 0;
        totalDeducciones += parseFloat((sancion.valor_sancion_privada + "").replaceAll(",", "")) || 0;
      });
    }
  }

  // Libranza
  if (formDeduccionesCheckbox.libranza) {
    sumarValoresArrayDeducciones(nominaData.libranza, 'valor');
  }

  // Pagao a Tercero Deducciones
  if (formDeduccionesCheckbox.pagao_tercero_deducciones) {
    sumarValoresArrayDeducciones(nominaData.pagao_tercero_deducciones, 'valor');
  }

  // Anticipos Deducciones
  if (formDeduccionesCheckbox.anticipos_deducciones) {
    sumarValoresArrayDeducciones(nominaData.anticipos_deducciones, 'valor');
  }

  // Otras Deducciones
  if (formDeduccionesCheckbox.otras_deducciones) {
    sumarValoresArrayDeducciones(nominaData.otras_deducciones, 'valor');
  }

  // Deducciones directas (valores únicos)
  if (formDeduccionesCheckbox.pension_voluntaria) {
    totalDeducciones += parseFloat((nominaData.pension_voluntaria + "").replaceAll(",", "")) || 0;
  }

  if (formDeduccionesCheckbox.retencion_fuente) {
    totalDeducciones += parseFloat((nominaData.retencion_fuente + "").replaceAll(",", "")) || 0;
  }

  if (formDeduccionesCheckbox.ahorro_fomento_construccion) {
    totalDeducciones += parseFloat((nominaData.ahorro_fomento_construccion + "").replaceAll(",", "")) || 0;
  }

  if (formDeduccionesCheckbox.coperativa) {
    totalDeducciones += parseFloat((nominaData.coperativa + "").replaceAll(",", "")) || 0;
  }

  if (formDeduccionesCheckbox.embargo_fiscal) {
    totalDeducciones += parseFloat((nominaData.embargo_fiscal + "").replaceAll(",", "")) || 0;
  }

  if (formDeduccionesCheckbox.plan_complementario) {
    totalDeducciones += parseFloat((nominaData.plan_complementario + "").replaceAll(",", "")) || 0;
  }

  if (formDeduccionesCheckbox.educacion) {
    totalDeducciones += parseFloat((nominaData.educacion + "").replaceAll(",", "")) || 0;
  }

  if (formDeduccionesCheckbox.reintegro_deduccion) {
    totalDeducciones += parseFloat((nominaData.reintegro_deduccion + "").replaceAll(",", "")) || 0;
  }

  if (formDeduccionesCheckbox.deuda) {
    totalDeducciones += parseFloat((nominaData.deuda + "").replaceAll(",", "")) || 0;
  }
  
  let total = parseFloat(totalDeducciones.toFixed(2)); // Redondear a 2 decimales
  this.formActualizarNomina.get('totales').get('total_deducciones').reset(total);
}

}
