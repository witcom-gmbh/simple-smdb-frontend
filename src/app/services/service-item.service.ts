import { Injectable } from '@angular/core';
import { Observable,throwError  } from 'rxjs';
import {BehaviorSubject} from 'rxjs';

import { ServiceRetrievalV2Service,ServiceInstantiationV2Service } from '../api/services';
import { ServiceItemDto,ServiceDataSelectorDto,ServiceItemTreeDto,AttributeDto } from '../api/models';


@Injectable({
  providedIn: 'root'
})
export class ServiceItemService {
    
    private _UpdatedBSSource = new BehaviorSubject<number>(0);
    updatedBS$ = this._UpdatedBSSource.asObservable();


  constructor(
    private svcRetrieval:ServiceRetrievalV2Service,
    private svcInstantiation:ServiceInstantiationV2Service
  ) { }
  
  reloadBS(svcId:number):void{
      this._UpdatedBSSource.next(svcId);
  }
  
  getItemById(serviceItemId: number): Observable<ServiceItemDto> {
      return this.svcRetrieval.ServiceRetrievalGetServiceItemByIdV2(serviceItemId);
  }
  
  /**
   * Gets Service-Item by Item-Object. Useful for gettin service-item from service-tree
   * 
   */
  getItemByObject(svcObject:any): Observable<ServiceItemDto> {
        if( (typeof svcObject === "object") && (svcObject !== null) )
        {
            if (!svcObject.hasOwnProperty('_type')){
              return throwError("Not a valid object");  
            }
            let svcItemId=null;
            switch(svcObject._type){
                case "ServiceAssetTreeDto":
                  svcItemId = svcObject.serviceAsset.id;
                  break;
                case "ServiceAssetDto":
                  svcItemId = svcObject.id;
                  break;
                case "ServiceDto":
                  svcItemId = svcObject.id;
                  break;  
                case "ServiceTreeDto":
                  svcItemId = svcObject.service.id;
                  break;                  
                default:
                  return throwError("Unknown Svc-Item Type "+svcObject._type);
            }
            return this.getItemById(svcItemId);
        }
        return throwError("Not a object");
  }
  
  /**
   * Gets all attributes for given Service-Item
   * 
   */
  getItemAttributes(serviceItemId: number): Observable<Array<AttributeDto>> {
      return this.svcInstantiation.ServiceInstantiationGetServiceItemAttributesV2(serviceItemId);
  }


  
  getTreeById(serviceItemId: number): Observable<ServiceItemTreeDto> {
      var params = <ServiceRetrievalV2Service.ServiceRetrievalGetServiceItemTopLevelTreeByIdV2Params>{};
      var selector = <ServiceDataSelectorDto>{};
      selector.addCustomProperties=true;
      selector._type="ServiceDataSelectorDto";
      params.timestamp="";
      params.serviceItemId=serviceItemId;
      params.dataSelector=selector;
      
      return this.svcRetrieval.ServiceRetrievalGetServiceItemTopLevelTreeByIdV2(params);  
  }

  
}
