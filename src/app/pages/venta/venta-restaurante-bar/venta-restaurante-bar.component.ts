import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-venta-restaurante-bar',
  templateUrl: './venta-restaurante-bar.component.html',
  styleUrls: ['./venta-restaurante-bar.component.scss'],
})
export class VentaRestauranteBarComponent implements OnInit {

  pageView = 0;

  zoneId = null;
  tableId = null;
  zoneData = [{"id": 1}];

  ngOnInit() {
    setTimeout(() => {
      this.pageView = 1;
    }, 5000);
  }

  proccessListEvent(event) {
    this.zoneData = event;
  }
  
  
}
