// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import {  NgxLoggerLevel } from 'ngx-logger';
import { FormioAppConfig } from 'angular-formio';
import { KeycloakConfig } from 'keycloak-angular';

let formioConfig: FormioAppConfig = {
  appUrl: 'http://localhost:4200',
  apiUrl: 'http://localhost:4200',
  icons: 'fontawesome'
};

let LOGGER_CONFIG = {
    //serverLoggingUrl: '/api/logs',
    level: NgxLoggerLevel.DEBUG,
    serverLogLevel: NgxLoggerLevel.OFF
};

// Add here your keycloak setup infos
let keycloakConfig: KeycloakConfig = {
  url: 'https://auth.witcom-dev.services/auth',
  realm: 'demo-realm',
  clientId: 'demo-portal'
};


export const environment = {
  production: false,
  formioConfig:formioConfig,
  loggerConfig:LOGGER_CONFIG,
  keycloak: keycloakConfig
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
