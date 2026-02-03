import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'undsminutas'
})
export class UndsminutasPipe implements PipeTransform {

  transform(obj: any, sede: any = null, ...args: unknown[]): unknown {

    let undsVec = [
      { id: 1, value: 'Gr' },
      { id: 2, value: 'Cc' },
      { id: 3, value: 'Kl' },
      { id: 4, value: 'Und' },
      { id: 5, value: 'Paq' },
      { id: 6, value: 'Ltrs' },
    ];

    let foundUp = undsVec.find(element => element.value == obj.unidad);
    let foundUc = undsVec.find(element => element.value == obj.unidad_c);

    console.log(obj, sede);
    console.log(foundUp, foundUc);

    return sede.ed4;

    

    // Cuando la unidad patrón es Kl y la unidad de conversion es Gr
    if (foundUp.id == 1 && foundUc.id == 3) { 

      let t1 = (obj.g_edad1 * sede.ed4);
      let t2 = (obj.g_edad2 * sede.ed9);
      let t3 = (obj.g_edad3 * sede.ed14);

      return sede.ed4;

      return (t1+t2+t3);
    }
    // Cuando la unidad patrón es Und y la unidad de conversion es Paq
    else if (foundUp.id == 4 &&  foundUc.id == 5) {

      // Convertir todos a paquete

      /*
      let t1 = (obj.g_edad1 * obj.ed4)/obj.can;
      let t2 = (obj.g_edad2 * obj.ed9)/obj.can;
      let t3 = (obj.g_edad3 * obj.ed14)/obj.can;
      */

      return 1;

      // return (t1 + t2 + t3);

      // (subSubItem.g_edad3 * selectedSede.ed14))


    }
    // Cuando es diferente la unidad patrón 
    else {

    }

    return null;


  }

}
