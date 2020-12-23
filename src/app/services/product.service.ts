import { Injectable } from '@angular/core';
import { Observable,throwError  } from 'rxjs';
import { catchError, map, tap,flatMap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import t from 'typy';

import {ProductAttributeV1Service,ProductSearchV1Service,PrimaryAttributeV1Service} from '../api/services';
import {
    AttributeDefAssociationDto, ProductItemPrimaryMoneyDataDto, MoneyItemDto
} from '../api/models'

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
}
