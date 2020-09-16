
import {  NgxLoggerLevel } from 'ngx-logger';
import { KeycloakConfig } from 'keycloak-angular';
import { FormioAppConfig } from 'angular-formio';

let LOGGER_CONFIG = {
    //serverLoggingUrl: '/api/logs',
    level: NgxLoggerLevel.DEBUG,
    serverLogLevel: NgxLoggerLevel.OFF
};

let formioConfig: FormioAppConfig = {
  appUrl: 'http://localhost:4200',
  apiUrl: 'http://localhost:4200',
  icons: 'fontawesome'
};

// Add here your keycloak setup infos
let keycloakConfig: KeycloakConfig = {
  url: "https://auth.dev.witcom.services/auth",
  realm: "witcom",
  clientId: "demo-portal"
};

let smdbConfig = {
    url: 'https://apis.dev.witcom.services/smdb'
}

export const environment = {
  production: false,
  apiUrl:'https://apis.dev.witcom.services',
  formioConfig:formioConfig,
  loggerConfig:LOGGER_CONFIG,
  keycloak: keycloakConfig,
  smdbConfig: smdbConfig
};

