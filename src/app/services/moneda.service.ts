import { Injectable } from '@angular/core';
import { paisesMonedas } from '../constants/selects';

@Injectable({
  providedIn: 'root',
})
export class MonedaService {
  private paisesMonedas = paisesMonedas;

  constructor() {}

  /**
   * Retorna el símbolo dado el código ISO (ej: 'PEN' -> 'S/')
   * @param codigo Código de 3 letras
   */
  obtenerSimbolo(codigo: string): string {
    const moneda = this.paisesMonedas.find(
      (m) => m.codigo == codigo.toUpperCase(),
    );
    return moneda ? moneda.simbolo : '$'; // Retorna $ por defecto si no lo encuentra
  }
}
