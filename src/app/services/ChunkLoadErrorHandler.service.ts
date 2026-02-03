import { ErrorHandler, Injectable } from '@angular/core';
import Swal from 'sweetalert2';
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    const chunkFailedMessage = /ChunkLoadError: Loading chunk [\d]+ failed/;

    if (chunkFailedMessage.test(error.message)) {
      Swal.fire({
        title: 'Advertencia!',
        text: 'Se detectó un error de carga de fragmentos. Recargar aplicación...',
        icon: 'info',
        iconColor: '#145388',
        confirmButtonColor: '#145388',
      }).then((result) => {
        if (result.isConfirmed) {
          /* Sse recarga la pagina */
          window.location.reload();
        }
      });
    }
  }
}
