import { CurrencyPipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'precio'
})
export class PrecioPipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): unknown {
    const currencyPipe = new CurrencyPipe('es-CO');
    return currencyPipe.transform(value, 'COP', 'symbol', '1.0-0');  
  }

}
