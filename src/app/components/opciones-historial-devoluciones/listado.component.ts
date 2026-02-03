import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'opcionesHistorialDevolucionesComponent',
  templateUrl: './listado.component.html',
})
export class OpcionesHistorialDevolucionesComponent implements OnInit {

  constructor(
    private router: Router
  ) {}

  ngOnInit() {
  }


  navigator(router) {
    this.router.navigate([router]);
  }
}
