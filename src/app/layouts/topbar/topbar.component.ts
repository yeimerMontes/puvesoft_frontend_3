import { NotificacionesService } from './../../services/notificaciones.service';
import { Component, Inject } from '@angular/core';
import Swal from 'sweetalert2';
import * as $ from 'jquery';
import { UserService } from 'src/app/services/user.service';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { DOCUMENT } from '@angular/common';
import { environment } from 'src/environments/environment';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
})
export class TopbarComponent {
  visible: boolean = false; //para controlar la ivsibilidad del menu
  private _dataNotificaciones = [];
  loadingNotificaciones: boolean = false;
  backgroundColor = 'yellow';
  dataNotificacionesSanitizadas: SafeHtml[] = [];
  nombreUsuario = '';
  mostrarNotificaciones = false;
  notificacionesNoLeidas = 0;

  onSuccess(mensaje: any, tipo: any, title: any): void {
    if (tipo == 'success') {
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: title,
        text: '' + mensaje + ' !',
        showConfirmButton: false,
        timer: 1500,
      });
    } else {
      Swal.fire({
        title: title,
        text: '' + mensaje + '!',
        icon: 'info',
        iconColor: '#145388',
        confirmButtonColor: '#145388',
      });
    }
  }

  constructor(
    private sanitizer: DomSanitizer,
    private userService: UserService,
    private notificacionesService: NotificacionesService,
    private authService: AuthServiceService,
    @Inject(DOCUMENT) document: any
  ) {
    let hostname = document.location.hostname;

    let environmentConfig = environment[hostname];

    this.backgroundColor = environmentConfig.backgroundColor;
  }

  async ngOnInit(): Promise<void> {
    this.nombreUsuario = atob(localStorage.getItem(btoa('nombre')));

    this.getNotificacionesNoleidas();
  }

  optionMenu() {
    this.visible = true;
  }
  optionMenuQuitar() {
    this.visible = false;
  }

  onSignOut(): void {
    //localStorage.removeItem(btoa('token'));
    this.authService.logout();
  }

  openModalCambiarPassword(obj: {} = {}) {
    Swal.fire({
      title: 'Cambiar contraseña',
      html: `<div class="row">
        <div class="form-group col-md-6">
        <h6>Contraseña Antigua</h6>
        <input  class="form-control rounded" type="password" autocomplete="off" id="con1">
        </div>
        <div class="form-group col-md-6">
        <h6>Nueva Contraseña</h6>
        <input  class="form-control rounded" type="password" autocomplete="off" id="con2">
        </div>
        <div class="form-group col-md-6">
        <h6>Confirmar Contraseña</h6><label>
        <input  class="form-control rounded" type="password" autocomplete="off" id="con3">
        </div>
        </div> `,
      showCancelButton: true,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        var con1 = $('#con1').val();
        var con2 = $('#con2').val();
        var con3 = $('#con3').val();

        if (con1 != '' && con2 != '' && con3 != '') {
          let con2_array = con2.toString().split('');

          if (con2_array.length < 6) {
            this.onSuccess(
              'La nueva contraseña, por seguridad, no puede tener menos de 6 digitos...',
              'Advertencia',
              'Advertencia!'
            );
          } else {
            if (con2 == con3) {
              this.userService.updatePassword(con1, con2, con3).subscribe(
                (resp) => {
                  /* En el caso que este duplixado retorna 201 de lo contraro 200 */
                  if (resp.code == '202') {
                    this.onSuccess(resp.message, 'Advertencia', 'Advertencia!');
                  } else {
                    this.onSuccess(
                      resp.message,
                      'success',
                      'Contraseña Actualizada'
                    );
                  }
                },
                (err) => {
                  alert('Ocurrió un error');
                }
              );
            } else {
              this.onSuccess(
                'La nueva contraseña y la confirmación de contraseña no coinciden..',
                'Advertencia',
                'Advertencia!'
              );
            }
          }
        } else {
          this.onSuccess(
            'Debe diligenciar los campos para poder proceder al cambio de contraseña',
            'Cambiar contraseña',
            'Advertencia!'
          );
        }
      }
    });
  }

  get dataNotificaciones() {
    return this._dataNotificaciones;
  }

  toggleNotificaciones() {
    this.mostrarNotificaciones = !this.mostrarNotificaciones;

    this.loadingNotificaciones = true;
    this.notificacionesService.getNotificaciones().subscribe({
      next: (resp) => {
        this._dataNotificaciones = resp.data;

        this.loadingNotificaciones = false; //  Finaliza el loading

        this._dataNotificaciones = this.dataNotificaciones.map((n) => ({
          ...n,
          contenidoSanitizado: this.sanitizer.bypassSecurityTrustHtml(
            n.notificacion
          ),
        }));

        // Marcar como leídas al abrir
        if (this.mostrarNotificaciones) {
          this.dataNotificaciones.forEach((n) => (n.leido = true));
          this.actualizarContador();
        }
      },
      error: (error) => {
        console.error('Error cargando notificaciones', error);
        this.loadingNotificaciones = false; // Asegura que finalice si hay error
      },
    });
  }

  cerrarNotificaciones() {
    this.mostrarNotificaciones = false;
  }

  actualizarContador() {
    this.notificacionesNoLeidas = this.dataNotificaciones.filter(
      (n) => !n.leido
    ).length;
  }

  getNotificacionesNoleidas() {
    this.notificacionesService.getNotificacionesNoLeidas().subscribe({
      next: (resp) => {
        this.notificacionesNoLeidas = resp.data.no_leidas;
      },
      error: (error) => {
        console.error('Error cargando notificaciones', error);
      },
    });
  }
}
