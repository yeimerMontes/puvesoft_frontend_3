// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: true,
  buyUrl: 'https://1.envato.market/6NV1b',
  SCARF_ANALYTICS: false,
  adminRoot: '/app',
  apiUrl: 'https://api.coloredstrategies.com',
  defaultMenuType: 'menu-default',
  subHiddenBreakpoint: 1440,
  menuHiddenBreakpoint: 768,
  themeColorStorageKey: 'vien-themecolor',
  isMultiColorActive: true,
  /*
  Color Options:
  'light.blueyale', 'light.blueolympic', 'light.bluenavy', 'light.greenmoss', 'light.greenlime', 'light.yellowgranola', 'light.greysteel', 'light.orangecarrot', 'light.redruby', 'light.purplemonster'
  'dark.blueyale', 'dark.blueolympic', 'dark.bluenavy', 'dark.greenmoss', 'dark.greenlime', 'dark.yellowgranola', 'dark.greysteel', 'dark.orangecarrot', 'dark.redruby', 'dark.purplemonster'
  */
  defaultColor: 'light.blueyale',
  isDarkSwitchActive: true,
  defaultDirection: 'ltr',
  themeRadiusStorageKey: 'vien-themeradius',
  isAuthGuardActive: false,
  firebase: {
    apiKey: 'AIzaSyCqoNLB_jTw4nncO12qR-eDH9gAeWiZVaw',
    authDomain: 'vien-angular-login.firebaseapp.com',
    databaseURL: 'https://vien-angular-login.firebaseio.com',
    projectId: 'vien-angular-login',
    storageBucket: 'vien-angular-login.appspot.com',
    messagingSenderId: '16217062888',
    appId: '1:16217062888:web:6b08232ca0c9662fedb85d',
    measurementId: 'G-8ETT79WRRN',
  },
  baseUrl: 'https://conexion.puvesoft.co/api',
  // baseUrl: 'https://pruebaconexion.puvesoft.co/api',
  dominio: 'https://menu.puvesoft.co/',
  userExcel: 'http://localhost/excel_export/usuarios/',

  'localhost': {
    backgroundColor: 'blue', // Fondo
    backgroundColorActive: 'green', // Color de fondo de item en menu activo
    backgroundColorSubMenu: 'violet', // Color de fondo de submenu
    hrColorActive: 'yellow', // Color de borde para item activo de menú que contiene submenu
    hrColorInactive: 'blue', // Color de borde para elementos que no están activos de menú
    faviconUrl: '/assets/img/cibertura.png',
    logoLoginUrl: '/assets/img/cibertura.png',
    imagen: '/assets/img/regresar.png',
    backendUrl: 'http://localhost:8000/api',
    phone: '301 473 1355',
    website: 'www.puvesoft.info',
    titleSite: 'Localhostloasdf',
    backgroundImageLogin: '/assets/img/puvesoftbackground2.png',
    imgFacturaElectronica: '/assets/img/Factura-Elect-Pro.png',
    nameSite: 'Localhost',
    menuUrl: 'https://menu.puvesoft.info/',
  },

  'puvesoft.info': {
    backgroundColor: '#2c539e', // Fondo
    backgroundColorActive: '#3f71ce', // Color de fondo de item en menu activo
    backgroundColorSubMenu: '#446ab1', // Color de fondo de submenu
    hrColorActive: '#3f71ce', // Color de borde para item activo de menú que contiene submenu
    hrColorInactive: '#697dc0', // Color de borde para elementos que no están activos de menú
    faviconUrl: '/assets/img/favicon.png',
    logoLoginUrl: '/assets/img/puvesoft.png',
    imagen: '/assets/img/puvesoftH.png',
    backendUrl: 'https://conexion.puvesoft.info/api',
    phone: '301 473 1355',
    website: 'www.puvesoft.info',
    titleSite: 'Puvesoft',
    backgroundImageLogin: '/assets/img/puvesoftbackground2.png',
    imgFacturaElectronica: '/assets/img/Factura-Elect-Pro.png',
    nameSite: 'Puvesoft',
    menuUrl: 'https://menu.puvesoft.info/',
  },
  'pos.puvesoft.info': {
    backgroundColor: '#2c539e', // Fondo
    backgroundColorActive: '#3f71ce', // Color de fondo de item en menu activo
    backgroundColorSubMenu: '#446ab1', // Color de fondo de submenu
    hrColorActive: '#3f71ce', // Color de borde para item activo de menú que contiene submenu
    hrColorInactive: '#697dc0', // Color de borde para elementos que no están activos de menú
    faviconUrl: '/assets/img/favicon.png',
    logoLoginUrl: '/assets/img/puvesoft.png',
    imagen: '/assets/img/puvesoftH.png',
    backendUrl: 'https://conexion.puvesoft.info/api',
    phone: '301 473 1355',
    website: 'www.puvesoft.info',
    titleSite: 'Puvesoft',
    backgroundImageLogin: '/assets/img/puvesoftbackground2.png',
    imgFacturaElectronica: '/assets/img/Factura-Elect-Pro.png',
    nameSite: 'Puvesoft',
    menuUrl: 'https://menu.puvesoft.info/',
  },

  'pruebafrontend.puvesoft.info': {
    backgroundColor: '#2c539e', // Fondo
    backgroundColorActive: '#3f71ce', // Color de fondo de item en menu activo
    backgroundColorSubMenu: '#446ab1', // Color de fondo de submenu
    hrColorActive: '#3f71ce', // Color de borde para item activo de menú que contiene submenu
    hrColorInactive: '#697dc0', // Color de borde para elementos que no están activos de menú
    faviconUrl: '/assets/img/favicon.png',
    logoLoginUrl: '/assets/img/puvesoft.png',
    imagen: '/assets/img/puvesoftH.png',
    backendUrl: 'https://pruebaconexion.puvesoft.info/api',
    phone: '301 473 1355',
    website: 'www.pruebafrontend.puvesoft.info',
    titleSite: 'Puvesoft Prueba',
    backgroundImageLogin: '/assets/img/puvesoftbackground2.png',
    imgFacturaElectronica: '/assets/img/Factura-Elect-Pro.png',
    nameSite: 'Puvesoft Prueba',
    menuUrl: 'https://menu.puvesoft.info/',
  },

  'poscibertura.info': {
    backgroundColor: '#932c9e', // Fondo
    backgroundColorActive: '#932c9e', // Color de fondo de item en menu activo
    backgroundColorSubMenu: '#a93db5', // Color de fondo de submenu
    hrColorActive: '#8211bcdb', // Color de borde para item activo de menú que contiene submenu
    hrColorInactive: '#b569c0', // Color de borde para elementos que no están activos de menú
    faviconUrl: '/assets/img/cibertura.png',
    logoLoginUrl: '/assets/img/cibertura.png',
    imagen: '/assets/img/ciberturaH.png',
    backendUrl: 'https://conexion.poscibertura.info/api',
    phone: '315 421 7960',
    website: 'www.poscibertura.info',
    titleSite: 'Cibertura',
    backgroundImageLogin: '/assets/img/ciberturaFondo1.png',
    imgFacturaElectronica: '',
    nameSite: 'Cibertura',
    menuUrl: 'https://menu.poscibertura.info/',
  },

  'testfront.puvesoft.info': {
    backgroundColor: '#932c9e', // Fondo
    backgroundColorActive: '#932c9e', // Color de fondo de item en menu activo
    backgroundColorSubMenu: '#a93db5', // Color de fondo de submenu
    hrColorActive: '#8211bcdb', // Color de borde para item activo de menú que contiene submenu
    hrColorInactive: '#b569c0', // Color de borde para elementos que no están activos de menú
    faviconUrl: '/assets/img/cibertura.png',
    logoLoginUrl: '/assets/img/cibertura.png',
    imagen: '/assets/img/ciberturaH.png',
    backendUrl: 'https://pruebaconexion.puvesoft.info/api',
    phone: '315 421 7960',
    website: 'www.poscibertura.info',
    titleSite: 'Cibertura Prueba',
    backgroundImageLogin: '/assets/img/ciberturaFondo1.png',
    nameSite: 'Cibertura Prueba',
    menuUrl: 'https://menu.poscibertura.info/',
    imgFacturaElectronica: '',
  },
  'conectapos.info': {
    backgroundColor: 'rgb(1 151 134)', // Fondo
    backgroundColorActive: '#00b19d', // Color de fondo de item en menu activo
    backgroundColorSubMenu: '#00b19d', // Color de fondo de submenu
    hrColorActive: 'rgb(1 151 134)', // Color de borde para item activo de menú que contiene submenu
    hrColorInactive: '#697dc0', // Color de borde para elementos que no están activos de menú
    faviconUrl: '/assets/img/logo_conectapos.png',
    logoLoginUrl: '/assets/img/logo_conectapos.png',
    imagen: '/assets/img/logo_conectapos_blanco.png',
    backendUrl: 'https://conexion.puvesoft.info/api',
    // backendUrl: 'https://pruebaconexion.puvesoft.co/api',
    phone: '301 473 1355',
    website: 'www.conectapos.info',
    titleSite: 'ConectaPos',
    backgroundImageLogin: '/assets/img/fondo_conectapos.png',
    imgFacturaElectronica: '',
    nameSite: 'ConectaPos',
    menuUrl: 'https://menu.conectapos.info/',
  },
  'demo.conectapos.info': {
    backgroundColor: 'rgb(1 151 134)', // Fondo
    backgroundColorActive: '#00b19d', // Color de fondo de item en menu activo
    backgroundColorSubMenu: '#00b19d', // Color de fondo de submenu
    hrColorActive: 'rgb(1 151 134)', // Color de borde para item activo de menú que contiene submenu
    hrColorInactive: '#697dc0', // Color de borde para elementos que no están activos de menú
    faviconUrl: '/assets/img/logo_conectapos.png',
    logoLoginUrl: '/assets/img/logo_conectapos.png',
    imagen: '/assets/img/logo_conectapos_blanco.png',
    //backendUrl: 'https://conexion.puvesoft.co/api',
    backendUrl: 'https://pruebaconexion.puvesoft.info/api',
    phone: '301 473 1355',
    website: 'www.conectapos.info',
    titleSite: 'Demo ConectaPos',
    backgroundImageLogin: '/assets/img/fondo_conectapos.png',
    imgFacturaElectronica: '',
    nameSite: 'Demo ConectaPos',
    menuUrl: 'https://menu.conectapos.info/',
  },
  'facturador.puvesoft.info': {
    backgroundColor: '#2c539e', // Fondo
    backgroundColorActive: '#3f71ce', // Color de fondo de item en menu activo
    backgroundColorSubMenu: '#446ab1', // Color de fondo de submenu
    hrColorActive: '#3f71ce', // Color de borde para item activo de menú que contiene submenu
    hrColorInactive: '#697dc0', // Color de borde para elementos que no están activos de menú
    faviconUrl: '/assets/img/favicon.png',
    logoLoginUrl: '/assets/img/puvesoft.png',
    imagen: '/assets/img/puvesoftH.png',
    backendUrl: 'https://pruebaconexion.puvesoft.info/api',
    phone: '301 473 1355',
    website: 'www.facturador.puvesoft.info',
    titleSite: 'Puvesoft',
    backgroundImageLogin: '/assets/img/puvesoftbackground2.png',
    imgFacturaElectronica: '/assets/img/Factura-Elect-Pro.png',
    nameSite: 'Puvesoft',
    menuUrl: 'https://menu.conectapos.info/',
  },

};
