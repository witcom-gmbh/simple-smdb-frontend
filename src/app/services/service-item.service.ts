import { Injectable } from '@angular/core';
import { Observable,throwError, forkJoin, of  } from 'rxjs';
import { catchError, map, tap,flatMap } from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';
import t from 'typy';
import {ServiceTerm} from './ServiceTerm';
import {ProductService} from './product.service';
import { ServiceRetrievalV2Service,ServiceInstantiationV3Service,ServiceMgmtV1Service,ServiceMgmtV2Service,PrimaryAttributeV1Service } from '../api/services';
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
    ServiceMgmtUpdateParametersDto,
    AttributeDefAssociationDto,
    AttributeDefDto,
    AttributeStringDto,
    AbsoluteDiscountDto,
    MoneyDto,
    AccountingTypeDto
} from '../api/models';
import { SimpleProductAttrDefinition, ChangePrice, AttributePrice, UsagePrice, FreestylePrice } from '../models';
import { SplTranslatePipe } from '../shared/shared';
import { AttributeDecimalDto } from '../api/models/attribute-decimal-dto';
import { SmdbAccountingTypeService } from './smdb-accounting-type.service';


@Injectable({
  providedIn: 'root'
})
export class ServiceItemService {

    private _UpdatedBSSource = new BehaviorSubject<number>(0);
    updatedBS$ = this._UpdatedBSSource.asObservable();

    private _UpdatedSvcItemSource = new BehaviorSubject<ServiceItemDto>(null);
    updatedSvcItem$ = this._UpdatedSvcItemSource.asObservable();


  constructor(
    private svcRetrieval:ServiceRetrievalV2Service,
    //private svcMgmt:ServiceMgmtV1Service,
    private svcMgmt:ServiceMgmtV2Service,
    private svcInstantiation:ServiceInstantiationV3Service,
    private primaryAttrSvc:PrimaryAttributeV1Service,
    private productSvc:ProductService,
    private accountingTypeSvc:SmdbAccountingTypeService
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
      return this.svcRetrieval.ServiceRetrievalGetServiceItemByIdV2(serviceItemId).pipe(tap(data => {
                    //Signal refresh
                    this.notifySvcItemUpdate(data);
                }));
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




  getFreestylePricesForService(service:ServiceItemDto):Observable<Array<FreestylePrice>>{

    let prodId= service.productItem.id;
    let isFreestyleProperty="definesFreestylePrice";
    let freestylePriceAccountingTypeProperty="freestylePriceAccountingType";
    /**
     * Bedingungen
     * isFreestyleProperty == true
     * freestylePriceAccountingTypeProperty ist gesetzt
     *
     * Attribut muss ein numerisches Attribut sein
     */

    let attrDef = this.productSvc.getAttributeDefByProductItem(prodId);
    let serviceAttributes = this.getItemAttributes(service.id);

    return forkJoin(attrDef,serviceAttributes).pipe(
      map(([attrDef,serviceAttributes]) => {


        let freestylePrices:Array<FreestylePrice>=[];
        //let freestyleDefAttrs:Array<AttributeDefDto>=[];
        for (var aDef of attrDef ){
          //Alle Attribute die freestyle Preise definieren ermitteln
          let isFreestyleAttr:boolean=false;
          let hasFreestylePriceAccountingTypeDefined:boolean=false;
          if(aDef.attributeType._type=="AttributeDecimalTypeDto"){
            if (!t(aDef.attributeDef.customProperties.properties.find(it => it.name==isFreestyleProperty && it.value=="true")).isNullOrUndefined){
              isFreestyleAttr=true;
            }

            if (!t(aDef.attributeDef.customProperties.properties.find(it => it.name==freestylePriceAccountingTypeProperty && it.value!=null)).isNullOrUndefined){
              hasFreestylePriceAccountingTypeDefined=true;
            }
            if (isFreestyleAttr && hasFreestylePriceAccountingTypeDefined){
              //freestyleDefAttrs.push(aDef.attributeDef);
              //lookup the attribute in the service-item
              let svcAttr = serviceAttributes.find(it => it.attributeDef.attributeDef.id == aDef.attributeDef.id) as AttributeDecimalDto;
              let accountingTypeProperty=aDef.attributeDef.customProperties.properties.find(it => it.name==freestylePriceAccountingTypeProperty && it.value!=null);

              if ((t(svcAttr,'value').isNumber)&&(t(accountingTypeProperty,'value').isString)){
                //create very simple AccountingTypeDto
                let accountingType:AccountingTypeDto=this.accountingTypeSvc.getAccountingTypeByName(accountingTypeProperty.value)
                if(!t(accountingType).isNullOrUndefined){
                  let fsPriceMoney:MoneyDto={} as MoneyDto;
                  fsPriceMoney._type="MoneyDto";
                  fsPriceMoney.amount=svcAttr.value
                  fsPriceMoney.currency="EUR";

                  let attrObj:SimpleProductAttrDefinition = {'name':aDef.attributeDef.name,'displayName':aDef.attributeDef.displayName,'attributeDefId': aDef.attributeDef.id};

                  let price:FreestylePrice={} as FreestylePrice;
                  price.attribute = attrObj;
                  price.accountingType=accountingType;
                  price.price=fsPriceMoney;
                  freestylePrices.push(price);
                } else {
                  //good place to log an error...
                }
              }
            }
          }
        }

        return freestylePrices;

      })
    );

  }


  getUsageBasedPricesForService(service:ServiceItemDto):Observable<Array<UsagePrice>>{


    let usageBasedConfigProperty="usagebasedPricingConfiguration";
    let usageBasedPriceDefinedByProperty="usageBasedPriceDefinedBy";
    let priceDefValue="pricedefinition";
    let usageValue="usage";

    let prodId= service.productItem.id;

    let attrPricing = this.primaryAttrSvc.PrimaryAttributeGetPrimaryAttributePricingInformationV1(prodId);
    let attrDef = this.productSvc.getAttributeDefByProductItem(prodId);
    let serviceAttributes = this.getItemAttributes(service.id);

    return forkJoin(attrPricing,attrDef,serviceAttributes).pipe(
      map(([pricing,adefs,serviceAttributes]) => {

        //serviceAttributes[0].

        let priceDefAttrs:Array<AttributeDefDto>=[];
        for (var aDef of adefs ){
          //Alle Attribute die mengenabhaengige Preise definieren
          if (aDef.attributeDef.customProperties.properties.find(it => it.name==usageBasedConfigProperty && it.value==priceDefValue)){
            priceDefAttrs.push(aDef.attributeDef);
          }
        }

        let usagePriceDef:Array<AttributePrice>=[];
        if(!t(pricing.childAttributeEnumValues).isEmptyArray){
          //alle child-attributes durchlaufen
          for (var el of pricing.childAttributeEnumValues){
                if (priceDefAttrs.find (it => it.id == el.childAttributeDefId)){
                //nur mit preisen
                if(el.prices.length>0){
                    let attr = priceDefAttrs.find(it => it.id == el.childAttributeDefId);
                    if (attr){
                      let attrObj:SimpleProductAttrDefinition = {'name':attr.name,'displayName':attr.displayName,'attributeDefId': el.childAttributeDefId};
                      //nur ein preis pro attribut erlaubt -> ersten nehmen
                      let obj:AttributePrice = {attribute:attrObj,price:el.prices[0]}
                      usagePriceDef.push(obj)
                    }
                }
            }
          }
        }


        //Alle Attribute die Nutzungsmengen definieren
        let usageBasedUsageAttributes:Array<AttributeDecimalDto>=[];
        for (var attr of serviceAttributes ){
          switch (attr._type){
            case "AttributeDecimalDto":
              let tempDecAttr:AttributeDecimalDto = attr;
              if (tempDecAttr.attributeDef.attributeDef.customProperties.properties.find(it => it.name==usageBasedConfigProperty && it.value==usageValue)){
                usageBasedUsageAttributes.push(tempDecAttr);
              }

            break;
          }

        }

        let usagePriceInfo:Array<UsagePrice>=[];

        if(!t(usageBasedUsageAttributes).isEmptyArray){
          for ( var usageAttr of usageBasedUsageAttributes) {
            //console.log("Nutzung in",usageAttr);
            //Die Preisdefinition wird in der customProperty usageBasedPriceDefinedBy des Mengen-Attributs referenziert
            let attrPriceReference=usageAttr.attributeDef.attributeDef.customProperties.properties.find(it => it.name==usageBasedPriceDefinedByProperty);
            //Versuchen das Attribut zu finden, welches referenziert wird
            let priceDefAttr = usagePriceDef.find(it => it.attribute.name == attrPriceReference.value );
            if (priceDefAttr){
              //console.log("Preisdefinition in",priceDefAttr);

              //preis pro einheit aus dem referenzierten Merkmal ermitteln
              //let absDiscount:any = priceDefAttr.price.discount;
              if (priceDefAttr.price.discount._type=="AbsoluteDiscountDto"){
                let absDiscount = priceDefAttr.price.discount as AbsoluteDiscountDto;
                let pricePerUnit=absDiscount.money;
                //Summe berechnen
                let usageSum:MoneyDto={} as MoneyDto;
                usageSum._type="MoneyDto";
                usageSum.amount=pricePerUnit.amount * usageAttr.value;
                usageSum.currency=pricePerUnit.currency;

                //referenzierter Accounting-Type
                let accountingType=priceDefAttr.price.accountingType;
                let attrObj:SimpleProductAttrDefinition = {'name':usageAttr.attributeDef.attributeDef.name,'displayName':usageAttr.attributeDef.attributeDef.displayName,'attributeDefId': usageAttr.attributeDef.attributeDef.id};

                let obj={'attribute':attrObj,
                'accountingType':accountingType,
                'usage':usageAttr.value,
                'pricePerUnit':pricePerUnit,
                'calculatedPrice':usageSum
                };
                usagePriceInfo.push(obj);
              }
            }

          }


        }
        return usagePriceInfo;
      }

      )

    );
  }



  getChangePricesForService(service:ServiceItemDto):Observable<Array<ChangePrice>>{

    let prodId= service.productItem.id;

    let changeProperty="oneTimeChange";

    let attrPricing = this.primaryAttrSvc.PrimaryAttributeGetPrimaryAttributePricingInformationV1(prodId);
    let attrDef = this.productSvc.getAttributeDefByProductItem(prodId);

    return forkJoin(attrPricing,attrDef).pipe(
      map(([pricing,adefs]) => {

        let changeDefAttrs:Array<AttributeDefDto>=[];
        for (var aDef of adefs ){
          //Alle Attribute bei denen oneTimeChange = true ist
          if (aDef.attributeDef.customProperties.properties.find(it => it.name==changeProperty && it.value=="true" )){
            changeDefAttrs.push(aDef.attributeDef);
          }
        }

        let changePriceDef:Array<ChangePrice>=[];
        //pricing.
        if(!t(pricing.childAttributeEnumValues).isEmptyArray){

          //alle child-attributes durchlaufen
          for (var el of pricing.childAttributeEnumValues){
            //nur solche die oben als relevant fuer preisdefinitionen ermittelt wurden
            if (changeDefAttrs.find (it => it.id == el.childAttributeDefId)){
                //nur mit preisen
                if(el.prices.length>0){
                    let attr = changeDefAttrs.find(it => it.id == el.childAttributeDefId);
                    if (attr){
                      let attrObj:SimpleProductAttrDefinition = {'name':attr.name,'displayName':attr.displayName,'attributeDefId': el.childAttributeDefId};
                      //nur ein preis pro attribut erlaubt -> ersten nehmen
                      let obj:ChangePrice = {attribute:attrObj,price:el.prices[0]}
                      changePriceDef.push(obj)
                    }
                }
            }
          }
        }
        return changePriceDef;


      })
    );

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
      selector.addCustomProperties=true;
      selector.addProductInfo=true;
      selector.addPriceInfo=true;
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
      //svcItemParams.

      return this.svcMgmt
      //Update Service-Item
      .ServiceMgmtUpdateV2(svcItemParams)
      .pipe(flatMap(res => {
          //Update Pricing et al
          return this.svcInstantiation.ServiceInstantiationModifyServiceItemAttributesV3(params)
                .pipe(tap(data => {
                    //Signal Modification

                    this.reloadBS(data.owningBusinessServiceId);
                    this.notifySvcItemUpdate(data);
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

  notifySvcItemUpdate(svcId:ServiceItemDto):void{
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
