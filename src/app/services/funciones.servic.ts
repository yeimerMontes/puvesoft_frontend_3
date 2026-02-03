import Swal from 'sweetalert2';
import { HeadersParam } from '../helpers/header-token';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FuncionesService {
  constructor() {}

  get headers() {
    return HeadersParam.getHeaders();
  }
  /**
   * Recibe la información del formulario de inicio de sesión y la envía al servidor
   * para iniciar sesión
   *
   * @param body any
   * @returns Observable<any>
   */

  currency = (number: any, minimumFractionDigits: any): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits,
    }).format(number);
  };

  getFormatearNumero = (valor: any, usarDecimales: any): string => {
    const money = usarDecimales === 1 ? Math.round(valor) : valor;
    const minimumFractionDigits = usarDecimales === 1 ? 0 : 2;

    let num = this.currency(money, minimumFractionDigits);

    let b = num.split('.');
    if (b.length > 1) {
      let size = b[0].length;
      num = num.substring(0, size + 3);
    }

    return num;
  };

  formatNumberOnlyNoDecimal = (valor): string => {
    let arr = (valor + '').split('.');

    let initial = this.currency(arr[0], 0);

    if (arr.length > 1) {
      if (arr[1] !== '00') {
        initial = initial + '.' + arr[1];
      }
    }

    return initial;
  };

  countDecimalPoints(input: string): number {
    const match = input.match(/\./g);
    return match ? match.length : 0;
  }

  toFixPorcentaje(porcentaje) {
    if (porcentaje == null) {
      return 0;
    } else if (porcentaje < 0 || porcentaje > 100) {
      return 0;
    } else {
      var decPart = (porcentaje + '').split('.');
      if (decPart.length > 1) {
        let cont = decPart[1];
        if (cont.length > 1) {
          return porcentaje.toFixed(1);
        }
      }
      return porcentaje;
    }
  }

  getColorState(estado: number) {
    switch (estado) {
      case 1: // Pagado
        return 'rgb(77 165 100)';
      case 2: // Proceso
        return 'rgb(244, 155, 0)';
      case 3: // Anulado
        return 'rgb(223, 104, 104)';
      case 4: // Credito
        return 'rgb(46 117 159)';
      case 5: // Cortesia
        return '#00778b91';
      case 6: //  Plan separe
        return '#9b59b6';
    }
  }

    getColorStateNominaEnviada(estado: number) {
    switch (estado) {
      case 1: // Pagado
        return 'rgb(77, 165, 100)';
      case 0: // Proceso
        return 'rgb(244, 155, 0)';
    }
  }

  getColorStateCreditTipo(estado: number) {
    switch (estado) {
      case 4: // Credito
        return 'rgb(46 117 159)';
      case 6: //  Plan separe
        return '#9b59b6';
    }
  }

  getColorStateCreditoVenta(estado: number) {
    switch (estado) {
      case 1: // Pagado
        return 'rgb(77 165 100)';
      case 2: // Proceso
        return 'rgb(244, 155, 0)';
      case 3: // Anulado
        return 'rgb(223, 104, 104)';
      case 4: // Credito
        return 'rgb(244, 155, 0)';
      case 5: // Cortesia
        return '#00778b91';
      case 6: //  Plan separe
        return 'rgb(244, 155, 0)';
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

  getPriceIva(producto) {
    let arrImpuesto = [];
    if (Array.isArray(producto.impuesto)) {
      arrImpuesto = producto.impuesto;
    } else {
      arrImpuesto = JSON.parse(producto.impuesto);
    }

    producto.impuesto = arrImpuesto;

    if (producto.impuesto == null && producto.impuesto.length == 0) {
      return 0;
    }

    let sumaInpuesto = 0;

    for (let i = 0; i < producto.impuesto.length; i++) {
      let val = 0;

      let element = producto.impuesto[i];

      if (element.id == 4) {
        // 19%
        val = 19;
      }

      if (element.id == 3) {
        // 16%
        val = 16;
      }

      if (element.id == 5) {
        // 5%
        val = 5;
      }

      if (element.id == 6) {
        // 8%
        val = 8;
      }

      if (element.id == 7) {
        // 20%
        val = 20;
      }

      sumaInpuesto += val;
    }

    return sumaInpuesto;
  }
}
