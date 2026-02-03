import { Component, OnInit, } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'opcionesHistorialDevolucionesComprasComponent',
  templateUrl: './listado.component.html',
})
export class OpcionesHistorialDevolucionesComprasComponent implements OnInit {

  constructor(
    private router: Router
  ) {}

  ngOnInit() {
  }


  navigator(router) {
    this.router.navigate([router]);
  }
}
