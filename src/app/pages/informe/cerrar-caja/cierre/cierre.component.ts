import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TypeAlert } from 'src/app/constants/enums';
import Swal from 'sweetalert2';
import { CierreCajaService } from 'src/app/services/cierre-caja.service';

@Component({
  selector: 'app-cierre',
  templateUrl: './cierre.component.html',
  styleUrls: [
    '../../informe.component.css',
    '../../../../css/modulo.css',
  ],
})
export class CierreComponent implements OnInit {
  disabled = false;

  showTicket = false;
  idCierre = null;

  constructor(
    private formBuilder: FormBuilder,
    private cierreCajaService: CierreCajaService,
    private router: Router
  ) {}

  form: FormGroup; //variable que controla el formulario

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      fecha: [{ value: '', disabled: true }, []],
      valor_cierre: ['', [Validators.required]],
    });

    this.fechaActual();
  }

  formatNumber(n) {
    n = String(n).replace(/\D/g, '');
    return n === '' ? n : Number(n).toLocaleString().split('.').join(',');
  }

  valor_pagar(event) {
    this.form.controls.valor_cierre.setValue(this.formatNumber(event));
  }

  public addCierreCaja() {
    this.disabled = true;
    if (!this.form.controls.valor_cierre.value) {
      this.onSuccess(
        'Error',
        'Ingrese el valor del cierre de caja para continuar',
        TypeAlert.warning
      );
      this.disabled = false;
      return;
    }
    if (this.form.controls.valor_cierre.value < 0) {
      this.onSuccess(
        'Error',
        'Ingrese un valor válido, no se aceptan cantidades negativas',
        TypeAlert.warning
      );
      this.disabled = false;
      return;
    }
    this.cerrarCaja();
  }

  closeTicket(value: string) {
    this.router.navigate(['/informe/historialcaja']);
  }

  public cerrarCaja() { 
    let inicio_caja = this.form.value.valor_cierre;
    let valor = inicio_caja.replaceAll(',', '');
    this.cierreCajaService.addCierreCajaParaInformes({
      valor_cierre: valor,
    }).subscribe(
      (resp) => {
        this.onSuccess(
          'Cierre Exitoso',
          'Se ha realizado el cierre de caja de forma exitosa',
          TypeAlert.success
        );

        this.idCierre = resp.data[0].id;
        this.showTicket = true;
      },
      (resp) => {
        this.onSuccess(
          'Error',
          'Ha ocurrido un error al intentar realizar el cierre de caja',
          TypeAlert.warning
        );
        this.disabled = false;
      }
    );
  }

  onSuccess(title: string, mensaje: string, tipo: TypeAlert): void {
    if (tipo == TypeAlert.success) {
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: title,
        text: '' + mensaje + ' !',
        showConfirmButton: false,
        timer: 1500,
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

  fechaActual() {
    let date = new Date();
    let day = `${date.getDate()}`.padStart(2, '0');
    let month = `${date.getMonth() + 1}`.padStart(2, '0');
    let year = date.getFullYear();

    this.form.controls.fecha.setValue(`${year}-${month}-${day}`);
  }
}
