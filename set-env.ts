import { writeFile } from 'fs';
import { argv } from 'yargs';

// This is good for local dev environments, when it's better to
// store a projects environment variables in a .gitignore'd file
require('dotenv').config();

// Would be passed to script like this:
// `ts-node set-env.ts --environment=dev`
// we get it from yargs's argv object
const environment = argv.environment;
const isProd = environment === 'prod';

const targetPath = `./src/environments/environment.${environment}.ts`;
const envConfigFile = `
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
  url: "${process.env.KEYCLOAK_SERVER_URL}",
  realm: "${process.env.KEYCLOAK_REALM}",
  clientId: "${process.env.KEYCLOAK_CLIENT_ID}"
};

let smdbConfig = {
    url: '${process.env.API_SMDB_URL}'
}

export const environment = {
  production: ${isProd},
  apiUrl:'${process.env.API_URL}',
  formioConfig:formioConfig,
  loggerConfig:LOGGER_CONFIG,
  keycloak: keycloakConfig,
  smdbConfig: smdbConfig
};

`

writeFile(targetPath, envConfigFile, function (err) {
  if (err) {
    console.log(err);
  }

  console.log(`Output generated at ${targetPath}`);
});
