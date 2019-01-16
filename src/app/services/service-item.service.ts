import { Injectable } from '@angular/core';
import { Observable,throwError  } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';

import { ServiceRetrievalV2Service,ServiceInstantiationV2Service,ServiceMgmtV1Service } from '../api/services';
import { ContactRelationDto,ServiceItemDto,ServiceDataSelectorDto,ServiceItemTreeDto,AttributeDto,ServiceInstantiation_ModifyServiceItemAttributesRestHolder } from '../api/models';


@Injectable({
  providedIn: 'root'
})
export class ServiceItemService {
    
    private _UpdatedBSSource = new BehaviorSubject<number>(0);
    updatedBS$ = this._UpdatedBSSource.asObservable();


  constructor(
    private svcRetrieval:ServiceRetrievalV2Service,
    private svcMgmt:ServiceMgmtV1Service,
    private svcInstantiation:ServiceInstantiationV2Service
  ) { }
  
  reloadBS(svcId:number):void{
      this._UpdatedBSSource.next(svcId);
  }
  
  modifyServiceItem(serviceItemId,modifiedAttributes): Observable<ServiceItemDto>{
      var params = <ServiceInstantiationV2Service.ServiceInstantiationModifyServiceItemAttributesV2Params>{};
      
      var data = <ServiceInstantiation_ModifyServiceItemAttributesRestHolder>{};
      var selector = <ServiceDataSelectorDto>{};
      //selector.addCustomProperties=true;
      selector._type="ServiceDataSelectorDto";
      data.retainAttributeValues=true;
      data.recalculatePrices=true;
      data.serviceItemId=serviceItemId;
      data.dataSelector=selector;
      data.modifiedAttributes=modifiedAttributes;
      params.data = data;
      
      return this.svcInstantiation.ServiceInstantiationModifyServiceItemAttributesV2(params)
      .pipe(tap(data => {
          this.reloadBS(data.owningBusinessServiceId);
       }));
      
      
      //return;
      
  }
  
  getItemById(serviceItemId: number): Observable<ServiceItemDto> {
      return this.svcRetrieval.ServiceRetrievalGetServiceItemByIdV2(serviceItemId);
  }
  
    /**
   * Gets Service-Item by Item-Object. Useful for gettin service-item from service-tree
   * 
   */
  getItemIdByObject(svcObject:any): number {
        if( (typeof svcObject === "object") && (svcObject !== null) )
        {
            if (!svcObject.hasOwnProperty('_type')){
              return undefined;  
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
                  return undefined;
            }
            return svcItemId;
        }
        return undefined;
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
  
  getContactRelations(serviceItemId: number): Observable<Array<ContactRelationDto>>{
      return this.svcRetrieval.ServiceRetrievalGetServiceItemContactRelationsV2(serviceItemId);
      
      
  }
  
  replaceContactRelations(serviceItemId: number,contactRelations:Array<ContactRelationDto>): Observable<Array<ContactRelationDto>>{

      var params = <ServiceMgmtV1Service.ServiceMgmtReplaceServiceItemContactRelationsV1Params>{};
      params.serviceItemId = serviceItemId;
      params.contactRelations = contactRelations;
      return this.svcMgmt.ServiceMgmtReplaceServiceItemContactRelationsV1(params);
  }

  
}
