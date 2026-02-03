import { SucursalService } from 'src/app/services/sucursal.service';
import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  CanLoad,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AuthServiceService } from '../services/auth-service.service';

@Injectable({
  providedIn: 'root',
})
export class ValidaLicenciaGuard
  implements CanActivate, CanActivateChild, CanLoad
{
  constructor(
    private sucursalService: SucursalService,
    private router: Router
  ) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    return this.sucursalService.getVenSucursal().pipe(
      map((resp) => {
        if (resp && resp.data.ven_d >= 0) {
          return true;
        } else {
          this.router.navigate(['/renovar-licencia/'], {
            queryParams: { ven: resp.data.ven_d },
          });
          return false;
        }
      })
    );
  }
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    return this.sucursalService.getVenSucursal().pipe(
      map((resp) => {
        if (resp && resp.data.ven_d >= 0) {
          return true;
        } else {
          this.router.navigate(['/renovar-licencia'], {
            queryParams: { ven: resp.data.ven_d },
          });
          return false;
        }
      })
    );
  }
  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | boolean {
    return true;
  }
}
