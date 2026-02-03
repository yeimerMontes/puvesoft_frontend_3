import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, CanLoad, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { AuthServiceService } from '../services/auth-service.service';


@Injectable({
  providedIn: 'root'
})
export class VerifySessionGuard{
  constructor(private authService: AuthServiceService, private router: Router) { }
  canActivate(): Observable<boolean> | boolean {
    if(localStorage.getItem(btoa('token'))!=null){
      ////console.log('estoy aqui')

      return true;
    }else{
      ////console.log('sin token');
      this.router.navigate(['/account/login']);
      return false;
    }
  }
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | boolean {
      if(localStorage.getItem(btoa('token'))!=null){
        ////console.log('estoy aqui')
  
        return true;
      }else{
        ////console.log('sin token');
        this.router.navigate(['/account/login']);
        return false;
      }
  }
  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean> | boolean {
    return true;
  }
}