import { tap, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import {
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
  CanLoad,
} from '@angular/router';
import { Observable } from 'rxjs';
import { CierreCajaService } from '../services/cierre-caja.service';

@Injectable({
  providedIn: 'root',
})
export class AperturaCajaGuard
  implements CanActivate, CanActivateChild, CanLoad
{
  constructor(private cajaService: CierreCajaService, private router: Router) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    return this.cajaService.estadoCaja().pipe(
      map((resp) => {
        if (resp && resp.data && resp.data.length > 0) {
          return true;
        } else {
          this.router.navigate(['/informe/abrir-caja'], {
            queryParams: { returnUrl: state.url },
          });
          return false;
        }
      })
    );
  }
  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    return this.cajaService.estadoCaja().pipe(
      map((resp) => {
        if (resp && resp.data && resp.data.length > 0) {
          return true;
        } else {
          this.router.navigate(['/informe/abrir-caja'], {
            queryParams: { returnUrl: state.url },
          });
          return false;
        }
      })
    );
  }

  canLoad(): Observable<boolean> | boolean {
    return true;
  }
}
