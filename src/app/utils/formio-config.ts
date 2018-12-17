import { environment } from '../../environments/environment';
import { FormioAppConfig } from 'angular-formio';


export const formioConfiguration: FormioAppConfig = {
  appUrl: environment.formioConfig.appUrl,
  apiUrl: environment.formioConfig.apiUrl,
  icons: environment.formioConfig.icons
};