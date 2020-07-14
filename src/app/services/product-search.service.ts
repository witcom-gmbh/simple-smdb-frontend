import { Injectable } from '@angular/core';
import { Observable,throwError  } from 'rxjs';
import { catchError, map, tap,flatMap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import t from 'typy';

import {ProductSearchV1Service} from  '../api/services';
import {
    ProductDataSelectorDto,
    ProductItemDto
} from '../api/models';

@Injectable({
  providedIn: 'root'
})
export class ProductSearchService {

  constructor(
    private productSearch: ProductSearchV1Service
  ) { }

  /**
   * Search for product by name in given list of portfolios
   *
   * @param queryText
   * @param portfolioId
   */
  searchProduct(queryText:String,portfolioIds:Array<String>):Observable<ProductItemDto[]>{

    let portfolioFilter = "";
    if (!t(portfolioIds).isEmptyArray){
      let portfolioList=portfolioIds.join(",");
      portfolioFilter = "AND productPortfolio.id in ("+portfolioList+")"

    }

    if(t(queryText).isNullOrUndefined){
      queryText="*";
    }


    let params=<ProductSearchV1Service.ProductSearchFindProductItemsByQuery2V1Params>{};
    params.query="(status != DELETED AND status != DEPRECATED) AND text ~ \""+queryText+"\" AND customProperties#availableInWebshop = true "+portfolioFilter+ " AND standardProductCatalog.id > 0";
    params.productItemType="Product";

    params.dataSelector=<ProductDataSelectorDto>{};
    params.dataSelector.includeCustomProperties=true;
    params.dataSelector._type = "ProductDataSelectorDto";

    return this.productSearch.ProductSearchFindProductItemsByQuery2V1(params);
  }


}
