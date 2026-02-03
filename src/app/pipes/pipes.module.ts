import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrecioPipe } from './precio.pipe';
import { UndsminutasPipe } from './undsminutas.pipe';
import { SumminutasPipe } from './summinutas.pipe';
import { EstadoCreditoPipe } from './estado-credito.pipe';
import { EstadoCreditoCreditoPipe } from './estado-credito-credito.pipe';

@NgModule({
  declarations: [
    PrecioPipe,
    SumminutasPipe,
    UndsminutasPipe,
    EstadoCreditoPipe,
    EstadoCreditoCreditoPipe,
  ],
  imports: [CommonModule],
  exports: [
    PrecioPipe,
    SumminutasPipe,
    UndsminutasPipe,
    EstadoCreditoPipe,
    EstadoCreditoCreditoPipe,
  ],
})
export class PipesModule {
  static forRoot() {
    return {
      ngModule: PipesModule,
      providers: [],
    };
  }
}
