import { Injectable } from '@angular/core';
import { Observable,throwError  } from 'rxjs';
import { catchError, map, tap,flatMap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import t from 'typy';

import {ProductAttributeV1Service,ProductSearchV1Service} from '../api/services';
import {
    AttributeDefAssociationDto
} from '../api/models'

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(
    private productSearch: ProductSearchV1Service,
    private productAttributeSvc: ProductAttributeV1Service
  ) { }

  getAttributeDefByProductItem(productItemId:number):Observable<Array<AttributeDefAssociationDto>>{

    let params=<ProductAttributeV1Service.ProductAttributeFindAllAttributeDefsOfProductItemExV1Params>{};
    params.productItemId = productItemId;
    params.pricesAndCosts = false;

    return this.productAttributeSvc.ProductAttributeFindAllAttributeDefsOfProductItemExV1(params);

  }
}
