import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent } from 'rxjs';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class ConnectionService {
  private onlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  online$ = this.onlineSubject.asObservable();

  constructor() {
    fromEvent(window, 'online').subscribe(() => {
      this.onlineSubject.next(true);
    });

    fromEvent(window, 'offline').subscribe(() => {
      this.onlineSubject.next(false);
      Swal.fire({
        title: 'Alerta!',
        text: 'No hay conexión a Internet. Por favor, verifica tu conexión y recarga la página.',
        icon: 'info',
        iconColor: '#145388',
        confirmButtonColor: '#145388',
      });
    });
  }
}
