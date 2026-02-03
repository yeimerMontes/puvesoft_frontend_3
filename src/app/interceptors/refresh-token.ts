import { catchError } from 'rxjs/operators';
import { Injectable, Injector } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpClient,
  HttpHeaders,
  HttpSentEvent,
  HttpHeaderResponse,
  HttpProgressEvent,
  HttpResponse,
  HttpUserEvent,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { AuthServiceService } from '../services/auth-service.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Injectable()
export class RefreshTokenInterceptor implements HttpInterceptor {
  constructor(
    private injector: Injector,
    private authService: AuthServiceService,
    private router: Router,
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<
    | HttpSentEvent
    | HttpHeaderResponse
    | HttpProgressEvent
    | HttpResponse<any>
    | HttpUserEvent<any>
  > {
    return next.handle(request).pipe(
      catchError((errResp: HttpErrorResponse) => {
        if (errResp.status == 401) {
          localStorage.removeItem(btoa('token'));
          localStorage.removeItem(btoa('permisos'));
        }

        ///en el caso que no tenga permiso disparo una alerta
        if (errResp.status == 403) {
          this.router.navigate(['/account/acceso-denegado']);
        }

        const error =
          typeof errResp.error !== 'object'
            ? JSON.parse(errResp.error)
            : errResp.error;
        if (errResp.status == 401 && error.renew) {
          localStorage.setItem(btoa('token'), error.token);
          const http = this.injector.get(HttpClient);
          const cloneRequest = request.clone({
            setHeaders: { Authorization: `Bearer ${error.token}` },
          });
          return next.handle(cloneRequest);
        }
        if (errResp.status == 401 && !error.renew && error.renew != undefined) {
          this.authService.logout();
        }
        return throwError(errResp);
      }),
    );
  }
}
