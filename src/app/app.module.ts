import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutsModule } from './layouts/layouts.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { VerifySessionGuard } from './guards/verify-session.guard';
import { RefreshTokenInterceptor } from './interceptors/refresh-token';
import { RouterModule } from '@angular/router';
import { ConnectionService } from './services/ConnectionService.service';
import { GlobalErrorHandler } from './services/ChunkLoadErrorHandler.service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),

    HttpClientModule,

    LayoutsModule,

    AppRoutingModule,

    RouterModule,
  ],
  providers: [
    VerifySessionGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: RefreshTokenInterceptor,
      multi: true,
    },
    ConnectionService,
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
