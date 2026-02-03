import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HeadersParam } from '../helpers/header-token';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  private _urlApi = environment.baseUrl;

  constructor(private http: HttpClient, private router: Router,
    @Inject(DOCUMENT) document: any
    ) {    
    let hostname = document.location.hostname;

    let environmentConfig = environment[hostname];
    
    this._urlApi = environmentConfig.backendUrl;
  }

  get headers() {
    return HeadersParam.getHeaders();
  }
  /**
   * Recibe la información del formulario de inicio de sesión y la envía al servidor
   * para iniciar sesión
   *
   * @param body any
   * @returns Observable<any>
   */
  login(body: any): Observable<any> {
    const url = `${this._urlApi}/auth/login`;
    return this.http.post<any>(url, body);
  }

  login_admin(body: any): Observable<any> {
    const url = `${this._urlApi}/auth/loginUserAdminJwt`;
    return this.http.post<any>(url, body);
  }


  /* Gestiono el envio de email */

  sendEmail(body: any): Observable<any> {
    const url = `${this._urlApi}/sendMail`;
    return this.http.post<any>(url, body);
  }

  logout() {
    localStorage.removeItem(btoa('token'));
    localStorage.removeItem(btoa('rol'));
    localStorage.removeItem(btoa('nombre'));
    localStorage.removeItem(btoa('sucursal'));
    
    this.http
      .post<any>(`${this._urlApi}/auth/logout`, {}, this.headers)
      .subscribe(
        (resp) => {
          // console.log(resp)
          this.router.navigate(['/account/login']).then(() => {
            window.location.reload();
          });
        },
        (error) => {
          this.router.navigate(['/account/login']).then(() => {
             //window.location.reload();
          });
        }
      );
  }
}
