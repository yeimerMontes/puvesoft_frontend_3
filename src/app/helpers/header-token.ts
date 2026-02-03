import { HttpHeaders } from "@angular/common/http";

export class HeadersParam {
  // Método utilizado para enviar las cabeceras de la petición
  public static getHeaders() {
    const token = localStorage.getItem(btoa('token')) || "";

    let headers_object = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    });

    const httpOptions = {
      headers: headers_object,
    };
    return httpOptions;
  }
}
