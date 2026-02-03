import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FooterComponent } from './footer/footer.component';
import { LayoutComponent } from './layout.component';
import { RouterModule } from '@angular/router';
import { TopbarComponent } from './topbar/topbar.component';



@NgModule({
  declarations: [
    SidebarComponent,
    FooterComponent,
    LayoutComponent,
    TopbarComponent
  ],
  imports: [
    CommonModule,

    RouterModule
  ]
})
export class LayoutsModule { }
