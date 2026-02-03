import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HeadersParam } from '../helpers/header-token';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { DOCUMENT } from '@angular/common';


@Injectable({
  providedIn: 'root'
})
export class ExportarExcelService {

  private _urlApi = environment.baseUrl;


  constructor(private http: HttpClient,
    @Inject(DOCUMENT) document: any
    ) {    
    let hostname = document.location.hostname;

    let environmentConfig = environment[hostname];
    
    this._urlApi = environmentConfig.backendUrl;
  }

  get headers() {
    return HeadersParam.getHeaders();
  }

  getExportar(json: any[], excelFileName: string){
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json)
    const workBook: XLSX.WorkBook = {
      Sheets: { 'data': worksheet },
      SheetNames: ['data']
    };

    const excelBuffer: any = XLSX.write(workBook, { bookType: 'xlsx', type: 'array' });

    this.saveAsExcel(excelBuffer, excelFileName)
    }

    
  saveAsExcel(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8'});
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + '.xlsx');
  }

}
