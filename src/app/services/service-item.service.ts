import { Injectable } from '@angular/core';
import { Observable,throwError  } from 'rxjs';
import { catchError, map, tap,flatMap } from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';
import t from 'typy';
import {ServiceTerm} from './ServiceTerm';
import { ServiceRetrievalV2Service,ServiceInstantiationV3Service,ServiceMgmtV1Service,ServiceMgmtV2Service } from '../api/services';
import {
    ContactRelationDto,
    ServiceItemDto,
    ServiceDataSelectorDto,
    ServiceTreeDataSelectorDto,
    ServiceItemTreeDto,
    AttributeDto,
    ServiceInstantiation_ModifyServiceItemAttributesRestHolder,
    CustomPropertyDto,
    CustomPropertiesDto,
    ServiceItemMultiplicityDto,
    MoneyItemDto,
    ServiceMgmtUpdateParametersDto
} from '../api/models';


@Injectable({
  providedIn: 'root'
})
export class ServiceItemService {

    private _UpdatedBSSource = new BehaviorSubject<number>(0);
    updatedBS$ = this._UpdatedBSSource.asObservable();

    private _UpdatedSvcItemSource = new BehaviorSubject<number>(0);
    updatedSvcItem$ = this._UpdatedSvcItemSource.asObservable();


  constructor(
    private svcRetrieval:ServiceRetrievalV2Service,
    //private svcMgmt:ServiceMgmtV1Service,
    private svcMgmt:ServiceMgmtV2Service,
    private svcInstantiation:ServiceInstantiationV3Service
  ) { }




  getAvailableServiceTermsForService(serviceItem:ServiceItemDto):Array<ServiceTerm>{
      if (serviceItem._type !== "ServiceDto") {
          return [];

      }
      let prop = this.getProductItemCustomPropertyByName(serviceItem.productItem,"availableServiceTerms");
      if (prop === undefined){
          return [];
      }

      return prop.multiValue.values.map(function(v,i){
          return {"value":v,"name":prop.multiValue.valuesFormatted[i]};
      }
      )

  }

  getContactRelations(serviceItemId: number): Observable<Array<ContactRelationDto>>{
      return this.svcRetrieval.ServiceRetrievalGetServiceItemContactRelationsV2(serviceItemId);
  }

  getChildrenMultiplicity(serviceItemId: number):Observable<Array<ServiceItemMultiplicityDto>>{
      return this.svcInstantiation.ServiceInstantiationGetChildrenServiceItemMultiplicitiesV3(serviceItemId);
  }

  getDefaultServiceTermForService(serviceItem:ServiceItemDto):ServiceTerm{
      if (serviceItem._type !== "ServiceDto") {
          return null;

      }
      let prop = this.getProductItemCustomPropertyByName(serviceItem.productItem,"defaultServiceTerms");
      if (prop === undefined){
          return null;
      }

      return <ServiceTerm>{name:prop.valueFormatted,value:prop.value};
  }


  getItemAttributes(serviceItemId: number): Observable<Array<AttributeDto>> {
      return this.svcInstantiation.ServiceInstantiationGetServiceItemAttributesV3(serviceItemId);
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

  getItemPrices(serviceItemId: number): Observable<Array<MoneyItemDto>>{
      let params =<ServiceRetrievalV2Service.ServiceRetrievalGetServiceItemPricesV2Params>{
          serviceItemId:serviceItemId
      };
      return this.svcRetrieval.ServiceRetrievalGetServiceItemPricesV2(params);
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






  public getProductItemCustomPropertyByName(product:any,propertyName:string):any{
      let customProperties:any = product.customProperties;
      let prop = customProperties.properties.find(i => i.name === propertyName);
      if (t(prop).isNullOrUndefined){
          return undefined;
      }
      return prop;
      //return customProperties.properties.find(i => i.name === propertyName);
  }

  private getServiceItemCustomPropertyByName(serviceItem:ServiceItemDto,propertyName:string):CustomPropertyDto{
      let customProperties:any = serviceItem.customProperties;
      //return customProperties.properties.find(i => i.name === propertyName);
      let prop = customProperties.properties.find(i => i.name === propertyName);
      if (t(prop).isNullOrUndefined){
          return undefined;
      }
      return prop;
  }

  private getServiceItemCustomPropertyValueByName(serviceItem:ServiceItemDto,propertyName:string):string{
      let customProperties:CustomPropertiesDto = serviceItem.customProperties;
      let property = customProperties.properties.find(i => i.name === propertyName);
      if (property === undefined) return undefined;
      return property.value;
  }

  getServiceItemExtendedConfig(serviceItem:ServiceItemDto,propertyName:string):any{
      //(res === undefined) ? undefined : JSON.parse(res)
      let res = this.getServiceItemCustomPropertyValueByName(serviceItem,propertyName);
      return (res === undefined) ? undefined : JSON.parse(res);
  }


  getServiceTerms(serviceItem:ServiceItemDto):ServiceTerm{
      if (serviceItem._type !== "ServiceDto") {
          return null;

      }
      let prop = this.getServiceItemCustomPropertyByName(serviceItem,"serviceTerms");
      if (prop === undefined){
          return null;
      }
      if (prop.value===null){
          return null;

      }
      return <ServiceTerm>{name:"",value:prop.value};

  }

  getTreeById(serviceItemId: number): Observable<ServiceItemTreeDto> {
      var params = <ServiceRetrievalV2Service.ServiceRetrievalGetServiceItemTopLevelTreeById2V2Params>{};

      var selector = <ServiceTreeDataSelectorDto>{};
      var serviceSelector = <ServiceDataSelectorDto>{};
      serviceSelector._type="ServiceDataSelectorDto";
      serviceSelector.addCustomProperties=true;


      selector._type="ServiceTreeDataSelectorDto";
      selector.serviceDataSelector = serviceSelector;
      params.timestamp="";
      params.serviceItemId=serviceItemId;
      params.dataSelector=selector;

      return this.svcRetrieval.ServiceRetrievalGetServiceItemTopLevelTreeById2V2(params);
  }

  private isAttributeUpdateable(serviceItem:ServiceItemDto,attribute:AttributeDto):boolean{

    //FUNCTIONAL attributes only
    if(attribute.attributeDef.attributeDef.functionalType === "FUNCTIONAL"){
        if ((serviceItem.status !== "TEST") && (serviceItem.status !== "INWORK")){
            return false;
        }
    }

    if (t(attribute,"attributeDef.attributeDef.readonly").isTrue){
          return false;

    }
    return true;
  }

  /*
  * Returns a list of available Accounting-Type SystemIDs for the given service-item
  * Service-Item has to be a SERVICE
  *
  */
  getAvailableAccountingTypes(serviceItem:ServiceItemDto):Array<String>{
    if (serviceItem._type !== "ServiceDto") {
          return [];

    }
    let prop = this.getProductItemCustomPropertyByName(serviceItem.productItem,"availableAccountingTypes");
    if (prop === undefined){
        return [];

    }
    if (!t(prop, 'multiValue.values').isDefined){
      return [];
    }
    //console.log(prop);

    return prop.multiValue.values;

  }

  isServicePricingTermBased(serviceItem:ServiceItemDto):boolean{
      if (serviceItem._type !== "ServiceDto") {
          return false;

      }
      let prop = this.getProductItemCustomPropertyByName(serviceItem.productItem,"pricingTermBased");
      if (prop === undefined){
          return false;

      }
      return JSON.parse(prop.value);

  }



  updateServiceItem(serviceItem:ServiceItemDto): Observable<ServiceItemDto>{
      var svcItemParams = <ServiceMgmtV1Service.ServiceMgmtUpdateServiceItemV1Params>{serviceItem:serviceItem};
      //Update Service-Item
      let params = <ServiceMgmtUpdateParametersDto>{};
      params._type = "ServiceMgmtUpdateParametersDto";
      params.serviceItemDto = serviceItem;
      return this.svcMgmt.ServiceMgmtUpdateV2(params);

      //return this.svcMgmt.ServiceMgmtUpdateServiceItemV2(svcItemParams);

  }

  updateServiceItemAttributes(serviceItemId:number,modifiedAttributes:Array<AttributeDto>): Observable<ServiceItemDto>{
      var params = <ServiceInstantiationV3Service.ServiceInstantiationModifyServiceItemAttributesV3Params>{};

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

      return this.svcInstantiation.ServiceInstantiationModifyServiceItemAttributesV3(params);
  }

  modifyServiceItemMultiplicity(serviceItemId:number,childAssocName:string,multiplicity:number): Observable<ServiceItemMultiplicityDto>{

      let params = <ServiceInstantiationV3Service.ServiceInstantiationModifyServiceItemMultiplicityV3Params>{
            parentServiceItemId:serviceItemId,
            childAssociationName:childAssocName,
            multiplicity:multiplicity,
            recalculatePrices:true,
            allowProductVariantOrderRemoval:false
      };
      return this.svcInstantiation.ServiceInstantiationModifyServiceItemMultiplicityV3(params);

  }

  modifyServiceItem(serviceItem:ServiceItemDto,modifiedAttributes): Observable<ServiceItemDto>{
      //ServiceMgmtV1Service.ServiceMgmtUpdateServiceItemV1Params
      //var svcItemParams = <ServiceMgmtV1Service.ServiceMgmtUpdateServiceItemV1Params>{serviceItem:serviceItem};

      var params = <ServiceInstantiationV3Service.ServiceInstantiationModifyServiceItemAttributesV3Params>{};

      var data = <ServiceInstantiation_ModifyServiceItemAttributesRestHolder>{};
      var selector = <ServiceDataSelectorDto>{};
      //selector.addCustomProperties=true;
      selector._type="ServiceDataSelectorDto";
      data.retainAttributeValues=true;
      data.recalculatePrices=true;
      data.serviceItemId=serviceItem.id;
      data.dataSelector=selector;
      data.modifiedAttributes=modifiedAttributes;
      params.data = data;


      let svcItemParams = <ServiceMgmtUpdateParametersDto>{};
      svcItemParams._type = "ServiceMgmtUpdateParametersDto";
      svcItemParams.serviceItemDto = serviceItem;

      return this.svcMgmt
      //Update Service-Item
      .ServiceMgmtUpdateV2(svcItemParams)
      .pipe(flatMap(res => {
          //Update Pricing et al
          return this.svcInstantiation.ServiceInstantiationModifyServiceItemAttributesV3(params)
                .pipe(tap(data => {
                    //Signal Modification
                    this.reloadBS(data.owningBusinessServiceId);
                }));
            }
          ));

      /*
      return this.svcInstantiation.ServiceInstantiationModifyServiceItemAttributesV2(params)
      .pipe(tap(data => {
          this.reloadBS(data.owningBusinessServiceId);
       }));*/
  }

  reloadBS(svcId:number):void{
      this._UpdatedBSSource.next(svcId);
  }

  notifySvcItemUpdate(svcId:number):void{
      this._UpdatedSvcItemSource.next(svcId);
  }

  replaceContactRelations(serviceItemId: number,contactRelations:Array<ContactRelationDto>): Observable<Array<ContactRelationDto>>{

      var params = <ServiceMgmtV2Service.ServiceMgmtReplaceContactRelationsV2Params>{};
      params.serviceItemId = serviceItemId;
      params.contactRelations = contactRelations;
      //let myparams;
      return this.svcMgmt.ServiceMgmtReplaceContactRelationsV2(params);
      //return this.svcMgmt.ServiceMgmtReplaceServiceItemContactRelationsV1(params);
  }





}
