import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { CierreCajaService } from 'src/app/services/cierre-caja.service';
import { FuncionService } from 'src/app/services/funcion.service';

@Component({
  selector: 'app-abrir-caja',
  templateUrl: './abrir-caja.component.html',
})
export class AbrirCajaComponent implements OnInit {
  formAperturaCaja: FormGroup; //variable que controla el formulario para hacer busqueda

  url = '/app/vien/dasboard';

  disabled = false;

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private cierreCajaService: CierreCajaService,
    private funcionService: FuncionService,
    private activeRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.formAperturaCaja = this.formBuilder.group({
      inicio_caja: ['', [Validators.required]],
    });

    this.url =
      this.activeRoute.snapshot.queryParamMap.get('returnUrl') ?? this.url;

    this.estadoCaja();
  }

  /* Gestiono estado de caja */
  /* ########################################################################### */
  estadoCaja() {
    /* Consulto el estado de la caja */
    this.cierreCajaService.estadoCaja().subscribe((resp) => {
      /* Si viene vacio quiere decir que no hay caja abierta */
      if (resp.data.length > 0) {
        this.router.navigate([this.url]);
      } else {
        this.funcionService.onSuccess(
          'Debe realizar la apertura para realizar esta operación...',
          'error',
          'Información!'
        );
      }
    });
  }

  formatNumber(n) {
    n = String(n).replace(/\D/g, '');
    return n === '' ? n : Number(n).toLocaleString().split('.').join(',');
  }

  valor_pagar(event) {
    this.formAperturaCaja.controls.inicio_caja.setValue(this.formatNumber(event));
  }

  addCierreCaja() {
    this.disabled = true;
    console.log('test');
    let inicio_caja = this.formAperturaCaja.value.inicio_caja;
    let valor = inicio_caja.replaceAll(',', '');
    if (valor < 0) {
      this.funcionService.onSuccess(
        'La apertura de caja no puede ser menor a 0....',
        'error',
        'Advertencia!'
      );
      this.disabled = false;
    } else if (valor === '') {
      this.funcionService.onSuccess(
        'Debe digitar un valor para poder continuar...',
        'error',
        'Advertencia!'
      );
      this.disabled = false;
    } else {
      var body = [];
      body.push({
        inicio_caja: valor,
      });

      this.cierreCajaService.addCierreCaja(body).subscribe(
        (resp) => {
          if (resp.code == '202') {
            this.funcionService.onSuccess(resp.message, 'error', 'Ya Existe!');
          } else {
            this.funcionService.onSuccess(
              resp.message,
              'success',
              'Apertura Exitosa!'
            );
          }
          this.router.navigate([this.url]);
        },
        (err) => {
          this.funcionService.onSuccess(
            'Ocurrió un error al abrir la caja',
            'error',
            'Apertura con error!'
          );
          this.disabled = false;
        }
      );
    }
  }
}
