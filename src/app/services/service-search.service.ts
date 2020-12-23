import { Injectable } from '@angular/core';
import { Observable,throwError  } from 'rxjs';
import { catchError, map, tap,flatMap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import t from 'typy';

import {ServiceSearchV1Service} from  '@app/api/services';
import {
    ServiceDataSelectorDto,
    ServiceItemDto
} from '@app/api/models';


@Injectable({
  providedIn: 'root'
})
export class ServiceSearchService {

  constructor(
    private serviceSearch: ServiceSearchV1Service
  ) { }

  /**
   *  Finds all service-items filtered by the given query-text
   *
   * @param queryText
   * @param serviceItemType Specifies the service item type to run the search on, may be null.<br>If null, the search will be run on the base type ServiceItem.
   */
  searchServiceItem(queryText:String,serviceItemType?:'ServiceItem' | 'ServiceGroup' | 'Service' | 'ServiceAsset' | 'ExternalService' | 'ProviderExternalService' | 'ConfiguredExternalService' | 'LinkedExternalService' | 'ServiceComponent'):Observable<ServiceItemDto[]>{

    let params=<ServiceSearchV1Service.ServiceSearchFindServiceItemsByQuery2V1Params>{};
    params.serviceItemType = serviceItemType;
    params.serviceDataSelector = <ServiceDataSelectorDto>{};
    params.serviceDataSelector._type="ServiceDataSelectorDto";
    params.serviceDataSelector.addCustomProperties=true;
    //params.query="(status != DELETED AND status != ARCHIVED) AND text ~ \""+queryText+"\"";
    //params.query="(status = TEST and product.productPortfolio.id = 10195566) AND (text ~ \""+queryText+"\" or customProperties#crmProject ~ \""+queryText+"\")";
    //params.query="(status = TEST and product.customProperties#availableInWebshop = true) AND (text ~ \""+queryText+"\" or customProperties#crmProject ~ \""+queryText+"\")";
    params.query="(status != DELETED AND status != ARCHIVED) AND product.customProperties#availableInWebshop = true AND (text ~ \""+queryText+"\" or customProperties#crmProject ~ \""+queryText+"\")";
    //and (text ~ "123" or customProperties#crmProject = "12345")


    return this.serviceSearch.ServiceSearchFindServiceItemsByQuery2V1(params);
  }

  /**
   * Finds all service filtered by the given query-text
   *
   * @param queryText
   *
   */
  searchService(queryText:String){
    return this.searchServiceItem(queryText,"Service");
  }
}
