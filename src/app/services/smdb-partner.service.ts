import { Injectable } from '@angular/core';
import { Observable,throwError  } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';

import { PartnerMgmtV1Service,PartnerRetrievalV2Service } from '../api/services';
import { PartnerDto,ContactDto,ContactQueryResultDto,ContactDataSelectorDto,PartnerDataSelectorDto } from '../api/models';


@Injectable({
  providedIn: 'root'
})
export class SmdbPartnerService {

    constructor(
        private partnerMgmt:PartnerMgmtV1Service,
        private partnerRetrieval:PartnerRetrievalV2Service
    ) { }


    getContactsByPartner(partnerId:number):Observable<ContactQueryResultDto>{
      let params =<PartnerRetrievalV2Service.PartnerRetrievalQueryContactsV2Params>{};
      let selector =<ContactDataSelectorDto>{};
      selector._type="ContactDataSelectorDto";
      selector.includeCustomProperties=true;
      selector.includeThumbnail=false;
      params.dataSelector=selector;
      params.partnerId = partnerId;
      return this.partnerRetrieval.PartnerRetrievalQueryContactsV2(params);
    }

    lookupPartner(query:string): Observable<Array<PartnerDto>>{
        var params = <PartnerRetrievalV2Service.PartnerRetrievalFindByQueryV2Params>{};
        let selector =<PartnerDataSelectorDto>{};
        selector._type="PartnerDataSelectorDto";
        selector.includeCustomProperties=true;
        params.dataSelector=selector;

        //params.loadForeignLinks=false;
        //params.loadAlternateLocations=false;
        params.query='(status = ACTIVE and (name ~ "'+query+'" or contacts.lastname ~ "'+query+'" or customerNumber ="'+query+'"))';
        //params.query='status=ACTIVE';
        return this.partnerRetrieval.PartnerRetrievalFindByQueryV2(params);

    }

    lookupContactByPartner(partnerId:number,query:string):Observable<Array<ContactDto>>{
        //PartnerRetrievalFindContactsByQueryV1(params: PartnerRetrievalV1Service.PartnerRetrievalFindContactsByQueryV1Params): Observable<Array<ContactDto>>
        var params = <PartnerRetrievalV2Service.PartnerRetrievalFindContactsByQueryV2Params>{};
        params.partnerId=partnerId;
        params.query='(lastname ~ "'+query+'" or firstname ~ "'+query+'")';
        return this.partnerRetrieval.PartnerRetrievalFindContactsByQueryV2(params);
    }
}
