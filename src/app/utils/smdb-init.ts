import { environment } from '../../environments/environment';
import { ApiConfiguration } from '../api/api-configuration';

export function initSMDBApiConfiguration(config: ApiConfiguration): Function {
  return () => {
    config.rootUrl = environment.smdbConfig.url;
  };
}


