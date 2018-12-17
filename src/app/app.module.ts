import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER,Provider } from '@angular/core';

import { AppComponent } from './app.component';
import { ApiConfiguration } from './api/api-configuration';
import { ApiModule } from './api/api.module';
import { initApiConfiguration } from './utils/smdb-init';
import { formioConfiguration } from './utils/formio-config';
import { AppRoutingModule } from './app-routing.module';
import { FormioModule, FormioAppConfig } from 'angular-formio';
import { ServicesModule } from './services/services.module';
import { SharedModule } from './shared/shared.module';
import { ServicemgmtModule } from './servicemgmt/servicemgmt.module';
import { HomeComponent } from './home/home.component';


export const INIT_API_CONFIGURATION: Provider = {
  provide: APP_INITIALIZER,
  useFactory: initApiConfiguration,
  deps: [ApiConfiguration],
  multi: true
};

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    ApiModule,
    AppRoutingModule,
    ServicesModule,
    SharedModule,
    ServicemgmtModule
  ],
  providers: [INIT_API_CONFIGURATION,,{provide: FormioAppConfig, useValue: formioConfiguration}],
  bootstrap: [AppComponent]
})
export class AppModule { }
