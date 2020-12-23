import { Injectable } from '@angular/core';
import { Observable,throwError  } from 'rxjs';
import { catchError, map, tap,flatMap } from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';
import t from 'typy';
import { ServiceRetrievalV2Service,ServiceInstantiationV3Service,ServiceMgmtV1Service, ServiceMgmtV2Service } from '../api/services';
import {
    ServiceTreeDataSelectorDto,
    ServiceDataSelectorDto,
    BusinessServiceTreeDto
} from '../api/models';



@Injectable({
  providedIn: 'root'
})
export class ServiceManagementService {

  constructor(
    private svcInstantiation:ServiceInstantiationV3Service,
    private svcMgmt:ServiceMgmtV2Service,
  ) { }

  /**
   * Discard Service = delete
   *
   * @param serviceId
   */
  deleteService(serviceId:number):Observable<null>{

    let params = <ServiceMgmtV2Service.ServiceMgmtSetStatusV2Params>{};
    params.serviceItemId=serviceId;
    params.newStatus="DELETED";
    return this.svcMgmt.ServiceMgmtSetStatusV2(params);
  }

  //ServiceInstantiationInstantiateProductV2
  instantiateBusinessServiceFromProdukt(productId:number,testInstantiation:boolean):Observable<BusinessServiceTreeDto>{
      let params = <ServiceInstantiationV3Service.ServiceInstantiationInstantiateProductV3Params>{};
      params.orderSystem="SPL.Manage";
      params.productId=productId;
      params.testInstantiation=testInstantiation;
      params.recalculatePrices=true;
      let dataSelector = <ServiceTreeDataSelectorDto>{};
      dataSelector.returnHeadWithTopLevelServiceItems=true;

      var serviceSelector = <ServiceDataSelectorDto>{};
      serviceSelector._type="ServiceDataSelectorDto";
      serviceSelector.addCustomProperties=true;
      dataSelector.serviceDataSelector = serviceSelector;

      dataSelector._type="ServiceTreeDataSelectorDto";
      params.dataSelector = dataSelector;
      return this.svcInstantiation.ServiceInstantiationInstantiateProductV3(params);
  }

}
