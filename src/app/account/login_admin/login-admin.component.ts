import { Component, Inject, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AuthServiceService } from 'src/app/services/auth-service.service';
import { Router } from '@angular/router';
import { SucursalService } from 'src/app/services/sucursal.service';
import { DOCUMENT } from '@angular/common';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login-admin.component.html',
  styleUrls: ['./login-admin.component.css'],
})
export class LoginAdminComponent {
  @ViewChild('staticModal', { static: false }) childModal?: ModalDirective;

  buttonDisabled = false;
  buttonState = '';

  buttonDisabled2 = false;
  buttonState2 = '';
  lockbutton: boolean = false;
  lockbuttonRecuperar: boolean = false;

  form: FormGroup; //variable que controla el formulario
  formPassword: FormGroup; //variable que controla el formulario
  user: string = '';
  password: string = '';

  backgroundColor = 'yellow';
  backgroundColorActive = 'orange';
  backgroundColorSubMenu = 'orange';
  hrColorActive = 'white';
  hrColorInactive = 'white';
  imagen = 'none';

  backgroundImageLogin = '';
  imgFacturaElectronica = ''
  sitioWeb = '';
  hovered = false;

  logoLoginUrl = '';

  constructor(
    private authService: AuthServiceService,
    // private notifications: NotificationsService,
    private router: Router,
    private formBuilder: FormBuilder, //Para formularios reactivos
    private sucursalService: SucursalService,
    @Inject(DOCUMENT) document: any
  ) {

    let hostname = document.location.hostname;


    let environmentConfig = environment[hostname];

    this.sitioWeb = environmentConfig.website;
    this.logoLoginUrl = environmentConfig.logoLoginUrl;

    this.backgroundColor = environmentConfig.backgroundColor;
    this.backgroundColorActive = environmentConfig.backgroundColorActive;
    this.hrColorActive = environmentConfig.hrColorActive;
    this.hrColorInactive = environmentConfig.hrColorInactive;
    this.imagen = environmentConfig.imagen;
    this.backgroundColorSubMenu = environmentConfig.backgroundColorSubMenu;

    this.backgroundImageLogin = environmentConfig.backgroundImageLogin;
    this.imgFacturaElectronica = environmentConfig.imgFacturaElectronica;
  }

  ngOnInit() {
    //Validación del formulario, cada uno de sus campos
    let urlTree = this.router.parseUrl(this.router.url);

    if (sessionStorage.getItem('reloadNeeded') === 'true') {
      // Limpiar la bandera
      sessionStorage.removeItem('reloadNeeded');
      
      // Navegar a la ruta deseada
      this.router.navigate(['/dashboard']);
    }

    this.user = urlTree.queryParams['user'];
    this.password = urlTree.queryParams['password'];

    this.form = this.formBuilder.group({
      usuario: [this.user, [Validators.required, Validators.minLength(3)]],
      usuario_admin: ['', [Validators.required]],
      password_admin: ['', [Validators.required]],
      type: [null, []]
    });

    this.formPassword = this.formBuilder.group({
      email: ['', [Validators.required]],
    });
  }

  /**
   * Comprueba que UN campo sea válido, por parámetro se le pasa el campo a evaluar
   *
   * @param campo string
   * @returns boolean
   */
  campoEsValido(campo: string) {
    return (
      this.form.controls[campo].errors && this.form.controls[campo].touched
    );
  }

  campoEsValido2(campo: string) {
    return (
      this.formPassword.controls[campo].errors &&
      this.formPassword.controls[campo].touched
    );
  }

  cleanData() {
    this.formPassword.reset({
      email: '',
    });
  }

  openModal() {
    this.cleanData();
    this.childModal?.show();
  }

  closeModal() {
    this.childModal?.hide();
  }

  /**
   * Valida que el formulario sea válido, de serlo usa el método login de AuthService, enviando
   * así la información del formulario y tomando los datos de acceso traídos desde la respuesta
   * (nombre, rol y token), almacenándolos en localstorage.
   *
   * @returns void
   */
  login() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.lockbutton = true;

    this.buttonDisabled = true;
    this.buttonState = 'show-spinner';


    this.form.controls.type.setValue(this.sitioWeb === 'www.conectapos.com');

    this.authService.login_admin(this.form.value).subscribe(
      (resp) => {
        //Usamos la función btoa('') para codificar los datos en base64.
        localStorage.setItem(btoa('token'), resp.access_token);
        localStorage.setItem(btoa('rol'), btoa(resp.rol));
        localStorage.setItem(btoa('nombre'), btoa(resp.nombre));

        this.sucursalService.getSucursal().subscribe((resp) => {
          let sucursal = resp.data;
          localStorage.setItem(
            btoa('sucursal'),
            btoa(JSON.stringify(sucursal))
          );
          this.vencimiento(resp.ven_d);
        });
      },
      (err) => {
        setTimeout(() => {
          this.buttonState = '';
          this.buttonDisabled = false;
          this.lockbutton = false;
        }, 500);

        Swal.fire({
          position: 'center',
          icon: 'warning',
          title: 'Alerta',
          text: 'Credenciales incorrectas',
          showConfirmButton: false,
          timer: 2500,
        });
      }
    );
  }

  vencimiento(dias: number) {
    if (dias < 0) {
      this.alert('Su licencia ha vencido ' + dias + '.');
    } else if (dias == 0) {
      this.alert('Su licencia vence Hoy ' + dias + '.');
    } else if (dias <= 7) {
      this.alert('Está a ' + dias + ' días de vencer su licencia.');
    } else {
      // Establecer una bandera en sessionStorage
      sessionStorage.setItem('reloadNeeded', 'true');
      // Recargar la página y luego proceder con la navegación
      location.reload();
    }
  }


  alert(message) {
    Swal.fire({
      title: 'Información',
      text: message,
      icon: 'warning',
      iconColor: '#DC562F',
      showCancelButton: false,
      confirmButtonColor: '#145388',
      confirmButtonText: 'OK',
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  validarCorreoElectronico(correo: string): boolean {
    // Expresión regular para validar una dirección de correo electrónico
    const regexCorreo = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Comprueba si la cadena cumple con el patrón de la expresión regular
    return regexCorreo.test(correo);
  }

  recuperarPasword() {
    this.lockbuttonRecuperar = true;

    if (
      this.validarCorreoElectronico(this.formPassword.controls.email.value) ==
      false &&
      this.formPassword.controls.email.value != null
    ) {
      this.alert('Email no valido');
      Swal.fire({
        position: 'center',
        icon: 'warning',
        title: 'Advertencia',
        text: 'Email no valido',
        showConfirmButton: false,
        timer: 2500,
      });

      this.lockbuttonRecuperar = false;

      return;
    }


    this.authService.sendEmail(this.formPassword.value).subscribe(
      (resp) => {
        this.lockbuttonRecuperar = false;

        this.closeModal();
        Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'Envio Exitoso',
          text: 'E-mail enviado exitosamente, por favor revise su correo electrónico',
          showConfirmButton: false,
          timer: 2500,
        });
      },
      (err) => {
        setTimeout(() => {
          this.lockbuttonRecuperar = false;
        }, 500);

        Swal.fire({
          position: 'center',
          icon: 'warning',
          title: 'Error',
          text: 'No pudo ser enviada la información a su correo',
          showConfirmButton: false,
          timer: 2500,
        });
      }
    );
  }
}
