import { Component, OnInit,Input } from '@angular/core';
import { Router } from "@angular/router";

import t from 'typy';
import { NGXLogger } from 'ngx-logger';
import { AlertService } from 'ngx-alerts';
import {Subscription} from 'rxjs';
import { Observable,throwError,of  } from 'rxjs';
import { FormControl } from '@angular/forms';
import {SplTranslatePipe} from '../shared/shared.module';
import {ProductSearchService,ServiceItemService,ServiceManagementService} from '../services/services';
import {
    ProductItemDto, ServiceDto, NamedProductCatalogDto,
} from '../api/models';


@Component({
  selector: 'app-product-catalog',
  templateUrl: './product-catalog.component.html',
  styleUrls: ['./product-catalog.component.css']
})
export class ProductCatalogComponent implements OnInit {

  catalogs: NamedProductCatalogDto[];
  selectedCatalog:NamedProductCatalogDto;
  productsInCategory:ProductItemDto[];

  constructor(

        private logger: NGXLogger,
        private alertService: AlertService,
        //private serviceMgmt:ServiceManagementService,
        private router: Router,
        private productSearchService: ProductSearchService,
        //private svcItemService: ServiceItemService


  ) { }

  ngOnInit() {

    this.productSearchService.getAllNamedCatalogs().subscribe(res => {
      this.catalogs=res;
    });




  }

  changeCatalog(catalog:NamedProductCatalogDto){
    this.productSearchService.getProductsByNamedCatalog(catalog).subscribe(res => {
      this.productsInCategory=res;
    });


  }

}
