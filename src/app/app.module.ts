import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { NgModule, APP_INITIALIZER,Provider } from '@angular/core';
import { LoggerModule } from 'ngx-logger';
import { AppComponent } from './app.component';
import { ApiConfiguration } from './api/api-configuration';
import { ApiModule } from './api/api.module';
import { initApiConfiguration } from './utils/smdb-init';
import { formioConfiguration } from './utils/formio-config';
import { AppRoutingModule } from './app-routing.module';
import { FormioModule, FormioAppConfig } from 'angular-formio';
import { ServicesModule } from './services/services.module';
import { SharedModule } from './shared/shared.module';
import { AppMaterialModule } from './shared/app-material.module';
import { ServicemgmtModule } from './servicemgmt/servicemgmt.module';
import { HomeComponent } from './home/home.component';
import { DfcModule } from './shared/dfc/dfc'
import { environment } from '../environments/environment';
import { AlertModule } from 'ngx-alerts';

import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { AppAuthGuard } from './app.authguard';
import { initializer } from './utils/app-init';


//import { FlexLayoutModule } from '@angular/flex-layout';

/*
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_CHIPS_DEFAULT_OPTIONS, MatCardModule, MatNativeDateModule } from "@angular/material";
import { DynamicFormsCoreModule } from "@ng-dynamic-forms/core";
import { DynamicFormsMaterialUIModule } from "@ng-dynamic-forms/ui-material";
*/


export const INIT_API_CONFIGURATION: Provider = {
  provide: APP_INITIALIZER,
  useFactory: initApiConfiguration,
  deps: [ApiConfiguration],
  multi: true
};

export const KEYCLOAK_PROVIDER: Provider = {
    provide: APP_INITIALIZER,
    useFactory: initializer,
    multi: true,
    deps: [KeycloakService]
};


@NgModule({

  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    NgbModule,
    BrowserAnimationsModule,
    ApiModule,
    AppRoutingModule,
    ServicesModule,
    SharedModule,
    ServicemgmtModule,
    DfcModule,
    AppMaterialModule,
    LoggerModule.forRoot(environment.loggerConfig),
    KeycloakAngularModule,
    AlertModule.forRoot({maxMessages: 5, timeout: 5000, position: 'right'})
  ],
  providers: [INIT_API_CONFIGURATION,KEYCLOAK_PROVIDER,{provide: FormioAppConfig, useValue: formioConfiguration}],
  bootstrap: [AppComponent]
})
export class AppModule { }
