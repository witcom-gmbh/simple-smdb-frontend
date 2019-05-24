import { Injectable } from '@angular/core';
import { Observable,throwError  } from 'rxjs';
import { catchError, map, tap,flatMap } from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';
import t from 'typy';
import { ServiceRetrievalV2Service,ServiceInstantiationV2Service,ServiceMgmtV1Service } from '../api/services';
import {
    ServiceDataSelectorDto,
    BusinessServiceTreeDto
} from '../api/models';



@Injectable({
  providedIn: 'root'
})
export class ServiceManagementService {

  constructor(
    private svcInstantiation:ServiceInstantiationV2Service
  ) { }
  
  //ServiceInstantiationInstantiateProductV2
  instantiateBusinessServiceFromProdukt(productId:number,testInstantiation:boolean):Observable<BusinessServiceTreeDto>{
      let params = <ServiceInstantiationV2Service.ServiceInstantiationInstantiateProductV2Params>{};
      params.orderSystem="SPL.Manage";
      params.productId=productId;
      params.testInstantiation=testInstantiation;
      params.recalculatePrices=true;
      let dataSelector = <ServiceDataSelectorDto>{};
      dataSelector.returnHeadWithTopLevelServiceItems=true;
      dataSelector.addProductInfo=true;
      dataSelector._type="ServiceDataSelectorDto";
      params.dataSelector = dataSelector;
      return this.svcInstantiation.ServiceInstantiationInstantiateProductV2(params);
  }
  
}
