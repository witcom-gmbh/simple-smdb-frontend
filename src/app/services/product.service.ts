import { Injectable } from '@angular/core';
import { Observable,throwError  } from 'rxjs';
import { catchError, map, tap,flatMap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import t from 'typy';

import {ProductAttributeV1Service,ProductSearchV1Service,PrimaryAttributeV1Service} from '../api/services';
import {
    AttributeDefAssociationDto, ProductItemPrimaryMoneyDataDto, MoneyItemDto, ProductItemDto, AttributeDefDto
} from '../api/models'
import { TAXONOMY_PREFIX_AVAILABILITY_REQUIREMENTS } from '../shared/constants.module';
import { LocationClassifier } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(
    private productSearch: ProductSearchV1Service,
    private productAttributeSvc: ProductAttributeV1Service,
    private primaryAttributeSvc: PrimaryAttributeV1Service
  ) { }

  getAttributeDefByProductItem(productItemId:number):Observable<Array<AttributeDefAssociationDto>>{

    let params=<ProductAttributeV1Service.ProductAttributeFindAllAttributeDefsOfProductItemExV1Params>{};
    params.productItemId = productItemId;
    params.pricesAndCosts = false;

    return this.productAttributeSvc.ProductAttributeFindAllAttributeDefsOfProductItemExV1(params);

  }

  getDefaultPricingForProduct(productItemId:number):Observable<Array<MoneyItemDto>>{

    return this.primaryAttributeSvc.PrimaryAttributeGetPrimaryAttributePricingInformationV1(productItemId).pipe(
      map((info:ProductItemPrimaryMoneyDataDto) => {
        console.log(info);
        return info.defaultPrices;
      })
    );

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

  /**
   * Get all ServiceAccessSubTypes that are required for offering a product
   *
   * @param product
   */
  public getProductAvailabilityRequirements(product:ProductItemDto):Array<string>{
    let requiredServiceAccessSubTypes:Array<string>=[];
    let limitedAvailability=this.getProductItemCustomPropertyByName(product,"limitedAvailability");


    if (!t('limitedAvailability.value').isTruthy){

      return requiredServiceAccessSubTypes;

    }
    let availabilityRequirementsProp=this.getProductItemCustomPropertyByName(product,"availabilityRequirements");
    if (t(availabilityRequirementsProp).isNullOrUndefined){

      return requiredServiceAccessSubTypes;
    }
    if(t(availabilityRequirementsProp.multiValue.values).isNullOrUndefined){

      return requiredServiceAccessSubTypes;
    }

    return availabilityRequirementsProp.multiValue.values.map(x => x.substr(TAXONOMY_PREFIX_AVAILABILITY_REQUIREMENTS.length))

  }

  public getServiceAccessAttributeDef(attrDef:Array<AttributeDefAssociationDto>,locationClassifier:LocationClassifier):AttributeDefAssociationDto{

    var saProcessor = "/attributeProcessor/serviceAccess"; // what to look for

    //let locationClassifier="aEnde";
    let matches = [];

    attrDef.forEach(function(e) {
        //console.log(e.attributeDef.customProperties.properties);
        //console.log(e.attributeDef.customProperties.properties.filter(p => p.value === needle));
        if (e.attributeDef.customProperties.properties.filter(p => p.value === saProcessor).length==1){
          //Service-Access A oder B-Ende ?
          if (e.attributeDef.customProperties.properties.filter(p => p.value === locationClassifier).length==1)
          {
            //Service-Access-Subtypen
            //Todo
            matches.push(e);
          }
        }
      });
    if(matches.length!=1){
      //throw error
      return null;
    }

    return matches[0];
  }

  public getLocationAttributeDef(attrDef:Array<AttributeDefAssociationDto>,locationClassifier:LocationClassifier):AttributeDefAssociationDto{

    var locationProcessor = "/attributeProcessor/lookup/location"; // what to look for
    //let locationClassifier="aEnde";
    let matches = [];
    attrDef.forEach(function(e) {
    if (e.attributeDef.customProperties.properties.filter(p => p.value === locationProcessor).length==1){
          //Location A oder B-Ende ?
          if (e.attributeDef.customProperties.properties.filter(p => p.value === locationClassifier).length==1)
          {
            matches.push(e);
          }
        }
    });
    if(matches.length!=1){
      //throw error
      return null;
    }

    return matches[0];
  }
}
