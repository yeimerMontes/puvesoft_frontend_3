import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PrintServiceService {
  private _isPrinting = new BehaviorSubject<boolean>(false);

  get isPrinting() {
    return this._isPrinting.asObservable();
  }

  printDiv(divName: string, printContents, is_carta = false): void {
    this._isPrinting.next(true);

    var device = navigator.userAgent;
    if (
      device.match(/Iphone/i) ||
      device.match(/Ipod/i) ||
      device.match(/Android/i) ||
      device.match(/J2ME/i) ||
      device.match(/BlackBerry/i) ||
      device.match(/iPhone|iPad|iPod/i) ||
      device.match(/Opera Mini/i) ||
      device.match(/IEMobile/i) ||
      device.match(/Mobile/i) ||
      device.match(/Windows Phone/i) ||
      device.match(/windows mobile/i) ||
      device.match(/windows ce/i) ||
      device.match(/webOS/i) ||
      device.match(/palm/i) ||
      device.match(/bada/i) ||
      device.match(/series60/i) ||
      device.match(/nokia/i) ||
      device.match(/symbian/i) ||
      device.match(/HTC/i)
    ) {
      let popupWin = window.open('', '_blank');
      popupWin.document.open();
      let body = `<body style="
            max-width: 377px;
            width: 377px;
            font-size: 7px;
            font-style: normal;
            line-height: normal;
            font-weight: normal;
            font-variant: normal;
            text-transform: none;
            color: #000;
          ">`;
      if (is_carta) {
        body = `<body style="
            font-size: 7px;
            font-style: normal;
            line-height: normal;
            font-weight: normal;
            font-variant: normal;
            text-transform: none;
            color: #000;
          ">`;
      }
      popupWin.document.write(`
        <html>
          <head>
            <title>Imprimir</title>
          </head>
          ${body}
            <!-- Define printContents here -->
            <div id="printContents">${printContents}</div>
            <script>
              window.onload = function() {
                window.print();
              };
    
              window.onbeforeunload = function() {
                var device = navigator.userAgent;
                var delay = (device.match(/Iphone/i) || device.match(/Ipod/i) || device.match(/Android/i) || device.match(/J2ME/i) || device.match(/BlackBerry/i) || device.match(/iPhone|iPad|iPod/i) || device.match(/Opera Mini/i) || device.match(/IEMobile/i) || device.match(/Mobile/i) || device.match(/Windows Phone/i) || device.match(/windows mobile/i) || device.match(/windows ce/i) || device.match(/webOS/i) || device.match(/palm/i) || device.match(/bada/i) || device.match(/series60/i) || device.match(/nokia/i) || device.match(/symbian/i) || device.match(/HTC/i))
                  ? 2500
                  : 500;
                setTimeout(function() {
                  window.close();
                }, delay);
              };
            </script>
          </body>
        </html>
      `);
      popupWin.document.close();
    } else {
      const printContents = document.getElementById(divName).innerHTML;
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.left = '-9999px';
      document.body.appendChild(iframe);
      const doc = iframe.contentWindow.document;
      const content = `
        <html>
          <head>
            <title></title>
          </head>
          <body>
            ${printContents}
          </body>
        </html>
      `;
      doc.open();
      doc.write(content);
      doc.close();
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      document.body.removeChild(iframe);
    }

    this._isPrinting.next(false);
  }
}
