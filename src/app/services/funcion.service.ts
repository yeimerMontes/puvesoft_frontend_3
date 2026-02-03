import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class FuncionService {

  constructor() { }

  onSuccess(mensaje: any, tipo: any, title: any): void {
    if (tipo == 'success') {
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: title,
        text: '' + mensaje,
        showConfirmButton: false,
        timer: 2500,
      });
    } else {
      Swal.fire({
        title: title,
        text: '' + mensaje,
        icon: 'info',
        iconColor: '#145388',
        showConfirmButton: false,
        timer: 2500,
      });
    }
  }

  onSuccessWithButton(mensaje: any, tipo: any, title: any): void {
    if (tipo == 'success') {
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: title,
        text: '' + mensaje,
      });
    } else {
      Swal.fire({
        title: title,
        text: '' + mensaje,
        icon: 'info',
        iconColor: '#145388',
      });
    }
  }

  onSuccessWithButtonHtml(mensaje: any, tipo: any, title: any): void {
    if (tipo == 'success') {
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: title,
        text: '' + mensaje,
      });
    } else {
      Swal.fire({
        title: title,
        // text: '' + mensaje,
        html: '' + mensaje,
        icon: 'info',
        iconColor: '#145388',
      });
    }
  }

  onSuccessBoton(mensaje: any, tipo: any, title: any): void {
      Swal.fire({
        title: title,
        html: '' + mensaje,
        icon: 'info',
        iconColor: '#145388',
        showConfirmButton: true,
        confirmButtonText: 'Entendido'
        // timer: 2500,
      });
  }
}
