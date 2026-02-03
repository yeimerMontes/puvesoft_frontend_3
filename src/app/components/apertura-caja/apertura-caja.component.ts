import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FuncionService } from 'src/app/services/funcion.service';
import { CierreCajaService } from 'src/app/services/cierre-caja.service';

@Component({
  selector: 'app-apertura-caja',
  templateUrl: './apertura-caja.component.html',
  styleUrls: ['./apertura-caja.component.css']
})
export class AperturaCajaComponent implements OnInit {

  @Input() id: number;
  @Input() type: number;
  @Output() editEvent = new EventEmitter<string>();

  disabled = false;

  formAperturaCaja: FormGroup; //variable que controla el formulario para hacer busqueda

  constructor(
    private formBuilder: FormBuilder, //Para formularios reactivos
    private funcionService: FuncionService,
    private cierreCajaService: CierreCajaService,
  ) { }

  ngOnInit(): void {
    this.formAperturaCaja = this.formBuilder.group({
      inicio_caja: ['', [Validators.required]],
    });
  }

  closeComponent() {
    this.editEvent.emit('');
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
          this.closeComponent();
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
