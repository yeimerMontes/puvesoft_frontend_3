import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'estadoCredito',
})
export class EstadoCreditoPipe implements PipeTransform {
  transform(value: number, ...args: unknown[]): string {
    switch (value) {
      case 1:
        return 'Pagado';
      case 2:
        return 'En Proceso';
      case 3:
        return 'Anulado';
      case 4:
        return 'Crédito';
      case 5:
        return 'Cortesía';
      case 6:
        return 'Plan separe';
    }
  }
}
