import { Injectable } from '@angular/core';
import { HeadersParam } from '../helpers/header-token';

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

    return this.currency(money, minimumFractionDigits);
  };

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
}
