import { Injectable } from '@angular/core';
import { Observable,throwError  } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';

import { PartnerMgmtV1Service,PartnerRetrievalV1Service } from '../api/services';
import { PartnerDto,ContactDto,ContactQueryResultDto } from '../api/models';


@Injectable({
  providedIn: 'root'
})
export class SmdbPartnerService {

    constructor(
        private partnerMgmt:PartnerMgmtV1Service,
        private partnerRetrieval:PartnerRetrievalV1Service
    ) { }
    
    
    getContactsByPartner(partnerId:number):Observable<ContactQueryResultDto>{
        return this.partnerRetrieval.PartnerRetrievalQueryContactsV1(partnerId);
        
    }
    
    lookupPartner(query:string): Observable<Array<PartnerDto>>{
        var params = <PartnerRetrievalV1Service.PartnerRetrievalFindByQueryV1Params>{};
        params.loadForeignLinks=false;
        params.loadAlternateLocations=false;
        params.query='(status = ACTIVE and (name ~ "'+query+'" or contacts.lastname ~ "'+query+'" or customerNumber ="'+query+'"))';
        //params.query='status=ACTIVE';
        return this.partnerRetrieval.PartnerRetrievalFindByQueryV1(params);
        
    }

    lookupContactByPartner(partnerId:number,query:string):Observable<Array<ContactDto>>{
        //PartnerRetrievalFindContactsByQueryV1(params: PartnerRetrievalV1Service.PartnerRetrievalFindContactsByQueryV1Params): Observable<Array<ContactDto>>        
        var params = <PartnerRetrievalV1Service.PartnerRetrievalFindContactsByQueryV1Params>{};
        params.partnerId=partnerId;
        params.query='(lastname ~ "'+query+'" or firstname ~ "'+query+'")';
        return this.partnerRetrieval.PartnerRetrievalFindContactsByQueryV1(params);
    }
}
