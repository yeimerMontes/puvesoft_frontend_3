import { DOCUMENT } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import menuItems, { IMenuItem } from 'src/app/constants/menu';
import { RoleService } from 'src/app/services/role.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  menuItems: IMenuItem[] = menuItems;
  subItems: IMenuItem[] = [];
  optionSelect: String = 'Inicio';
  optionSelectSubMenu: String;
  visible: boolean = false; //para controlar la ivsibilidad del menu

  backgroundColor = 'yellow';
  backgroundColorActive = 'orange';
  backgroundColorSubMenu = 'orange';
  hrColorActive = 'white';
  hrColorInactive = 'white';
  imagen = 'none';
  website = '';

  hovered = false;

  constructor(
    private roleService: RoleService,
    private router: Router,
    @Inject(DOCUMENT) document: any
  ) {
    let hostname = document.location.hostname;

    let environmentConfig = environment[hostname];

    this.backgroundColor = environmentConfig.backgroundColor;
    this.backgroundColorActive = environmentConfig.backgroundColorActive;
    this.hrColorActive = environmentConfig.hrColorActive;
    this.hrColorInactive = environmentConfig.hrColorInactive;
    this.imagen = environmentConfig.imagen;
    this.backgroundColorSubMenu = environmentConfig.backgroundColorSubMenu;
    this.website = environmentConfig.website;
    console.log(this.hrColorActive, this.hrColorInactive);
  }

  ngOnInit() {
    this.loadData();
  }

  filteredMenuItems(menuItems: IMenuItem[]): IMenuItem[] {
    return menuItems;
  }

  loadSubmenu(subs: IMenuItem[], option: string) {
    this.subItems = subs;
    //this.optionSelectSubMenu = option;

    this.optionSelect = option;
    this.visible = true;
  }

  /* Controlo la visibilidad cuando se le da click a una opcion que no lleva submenu */
  menuOptionSelect(option: string, router: string) {
    this.optionSelect = option;
    this.visible = false;

    /* Gestiono navegacion */
    this.navigator(router);
  }
  /* Controlo la visibilidad cuando se le da click a una opcion en el submenu */
  subMenuOptionSelect(router: string) {
    this.visible = false;

    /* Gestiono navegacion */
    if (router != null) {
      this.navigator(router);
    }
  }

  /**
   * Obtener los permisos del usuario logueado y borrar los permisos que no son de él
   */
  data = [];

  sucursal = null;

  isRestaurante = false;

  loadData() {
    this.roleService.getMisPermisos().subscribe((resp) => {
      this.data = resp.data;

      if (this.website == 'www.facturador.puvesoft.info') {
        const permisosAEliminar = [
          11, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 26, 27, 29, 30, 31, 32,
          33, 35, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51,
          52, 54, 55,
        ];
        this.data = resp.data.filter(
          (permiso) => !permisosAEliminar.includes(permiso.id)
        );
      }

      /* Lo ejecuto aqui dentro para que le de tiempo de descargar la informacion de la sucursal */
      this.sucursal = JSON.parse(
        decodeURIComponent(atob(localStorage.getItem(btoa('sucursal'))))
      );

      this.isRestaurante = this.sucursal.tipo_sucursal == 2 ? true : false;

      /* Guardo en el localstorage */
      localStorage.setItem(btoa('permisos'), btoa(JSON.stringify(resp.data)));

      for (let i = 0; i < this.menuItems.length; i++) {
        const element = this.menuItems[i];

        let val2 = 0;

        // corriendo para que los items que no tengan ningun dato no los muestre
        if (element.permiso) {
          if (!this.havePermission(element.permiso, element.tipo_sucursal)) {
            this.menuItems.splice(i, 1);
            i--;
          }
        }

        if (element.subs) {
          for (let j = 0; j < element.subs.length; j++) {
            const subElement = element.subs[j];

            if (!subElement.subs) {
              if (
                !this.havePermission(subElement.permiso, element.tipo_sucursal)
              ) {
                element.subs.splice(j, 1);
                j--;
              }
            }

            if (subElement.subs) {
              for (let k = 0; k < subElement.subs.length; k++) {
                const subSubElement = subElement.subs[k];

                if (
                  !this.havePermission(
                    subSubElement.permiso,
                    element.tipo_sucursal
                  )
                ) {
                  subElement.subs.splice(k, 1);
                  k--;
                }
              }
            }
          }
          val2 = element.subs.length;
        }

        if (!element.permiso && val2 === 0) {
          this.menuItems.splice(i, 1);
          i--;
        }
      }
      ////console.log(this.menuItems);
    });
  }

  /**
   * El permiso que está en el menú es un permiso del usuario que está logueado
   * @param permiso any
   * @returns boolean
   */
  havePermission(permiso: any, tipo_sucursal: any) {
    let data: any = null;
    if (permiso) {
      let i = this.data?.findIndex((element) => element.name === permiso);
      data = i > -1;

      if (tipo_sucursal && i > -1) {
        let i2 = this.data?.findIndex(
          (element) => element.name === tipo_sucursal
        );
        data = i2 > -1;
      }

      return data;
    }

    return false;
  }
  /* Navegar */
  navigator(router) {
    this.router.navigate([router]);
  }
}
