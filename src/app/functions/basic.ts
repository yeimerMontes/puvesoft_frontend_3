import { AbstractControl, ValidationErrors } from "@angular/forms";

export function emailValidator(control: AbstractControl): ValidationErrors | null {
    const email = control.value;
    // Expresión regular para validar el formato del correo
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
    // Si el correo no cumple con el patrón, se retorna un error
    if (email && !emailPattern.test(email)) {
      return { invalidEmail: true };
    }
  
    // Si el correo es válido, no retorna ningún error
    return null;
  }