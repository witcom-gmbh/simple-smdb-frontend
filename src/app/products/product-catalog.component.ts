import { Component, OnInit,Input } from '@angular/core';
import { Router } from "@angular/router";

import t from 'typy';
import { NGXLogger } from 'ngx-logger';
import { AlertService } from 'ngx-alerts';
import {Subscription} from 'rxjs';
import { Observable,throwError,of  } from 'rxjs';
import { FormControl } from '@angular/forms';
import {SplTranslatePipe} from '../shared/shared.module';
import {ProductSearchService,ServiceItemService,ServiceManagementService, ServiceAccessAvailabilityCheckService} from '../services/services';
import {
    ProductItemDto, ServiceDto, NamedProductCatalogDto,
} from '../api/models';
import { ServiceAccessObject } from '../models';


@Component({
  selector: 'app-product-catalog',
  templateUrl: './product-catalog.component.html',
  styleUrls: ['./product-catalog.component.css']
})
export class ProductCatalogComponent implements OnInit {

  catalogs: NamedProductCatalogDto[];
  selectedCatalog:NamedProductCatalogDto;
  productsInCategory:ProductItemDto[];

  private availabilitySubscription:Subscription;
  serviceAccessRequirements:Array<ServiceAccessObject>=[];

  constructor(

        private logger: NGXLogger,
        private alertService: AlertService,
        private router: Router,
        private productSearchService: ProductSearchService,
        private saCheckService: ServiceAccessAvailabilityCheckService

  ) { }

  ngOnInit() {
/*
    this.availabilitySubscription=this.saCheckService.UpdatedServiceAccessAvailability.subscribe(res=>{
      this.serviceAccessRequirements=res;
      //console.log(res);
    });
    */

    this.productSearchService.getAllNamedCatalogs().subscribe(res => {
      this.catalogs=res;
      if (res.length>0){
        this.selectedCatalog=res[0];

        this.changeCatalog(res[0]);
      }
    });




  }

  changeCatalog(catalog:NamedProductCatalogDto){
    this.productSearchService.getProductsByNamedCatalog(catalog).subscribe(res => {
      this.productsInCategory=res;
    });


  }

}
