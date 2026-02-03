import { Component, OnInit } from '@angular/core';
import { SucursalService } from '../services/sucursal.service';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.css']
})
export class PageComponent implements OnInit {

  constructor(
    private sucursalService: SucursalService
  ) {}

  ngOnInit(): void {
      this.sucursalService.getSucursal().subscribe((resp) => {
        let sucursal = resp.data;
        localStorage.setItem(
            btoa('sucursal'),
            btoa(encodeURIComponent(JSON.stringify(sucursal)))
          );
      });
  }
}
