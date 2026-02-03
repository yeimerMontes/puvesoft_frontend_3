import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'summinutas'
})
export class SumminutasPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return 'aaaa';
  }

}
