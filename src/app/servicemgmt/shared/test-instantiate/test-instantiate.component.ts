import { Component, OnInit,Input } from '@angular/core';
import { Router } from "@angular/router";

import t from 'typy';
import { NGXLogger } from 'ngx-logger';
import { AlertService } from 'ngx-alerts';
import {Subscription} from 'rxjs';
import { Observable,throwError,of  } from 'rxjs';
import { FormControl } from '@angular/forms';
import {SplTranslatePipe} from '../../../shared/shared.module';

import {
  startWith,
  map,
  debounceTime,
  mergeMapTo,
  mergeMap,
  switchMap,
  catchError
} from 'rxjs/operators';
import {ProductSearchService,ServiceItemService,ServiceManagementService} from '../../../services/services';
import {
    ProductItemDto, ServiceDto,
} from '../../../api/models';

//ServiceManagementService
@Component({
  selector: 'smdb-test-instantiate',
  templateUrl: './test-instantiate.component.html',
  styleUrls: ['./test-instantiate.component.css']
})
export class TestInstantiateComponent implements OnInit {

  @Input() productId:number;
  @Input() productName:string;

  public productAutoComplete$: Observable<ProductItemDto> = null;
  public autoCompleteControl = new FormControl();

  constructor(

        private logger: NGXLogger,
        private alertService: AlertService,
        private serviceMgmt:ServiceManagementService,
        private router: Router,
        private productSearchService: ProductSearchService,
        private svcItemService: ServiceItemService

  ) { }

  ngOnInit() {

    let portfolios:Array<String> = ["10195566"];

    this.productAutoComplete$ = this.autoCompleteControl.valueChanges.pipe(
      startWith(''),
      // delay emits
      debounceTime(300),
      // use switch map so as to cancel previous subscribed events, before creating new once
      switchMap(value => {
        if (value !== '') {
          // lookup from SMDB
          return this.productSearchService.searchProduct(value,portfolios);
        } else {
          // if no value is pressent, return null
          return of(null);
        }
      })
    );

    /*
    this.productSearchService.searchProduct('dsl',portfolios).subscribe(res =>{
      console.log(res);
    });
    */

  }

  clearSearchField(){

    this.autoCompleteControl.setValue(null);
  }

  displayFn(product?: ProductItemDto): string | undefined {
    console.log(product);
    if (t(product).isNullOrUndefined){
      return "";
    }

    let f = new SplTranslatePipe();
    return f.transform(product.displayName) + " - " + product.revision.major + "." +product.revision.minor;

  }

  createInstance(){

      this.serviceMgmt.instantiateBusinessServiceFromProdukt(this.autoCompleteControl.value.id,true).subscribe(
      response => {
          //Todo aus dem Service-Tree das Service-Element filtern, das aus dem Produkt instanziiert wurde
          console.log(response.serviceGroups[0].services[0].service.id);
          let serviceItem:ServiceDto = response.serviceGroups[0].services[0].service;
          //update service item
          //serviceItem.description = "this is a test";
          //serviceItem.customProperties.properties[3].value="12345";

          this.svcItemService.updateServiceItem(serviceItem).subscribe(updateRes => {
            let serviceId = updateRes.id;
            this.router.navigate(['/service-config', serviceId]).then( (e) => {
              if (e) {
                console.log("Navigation is successful!");
              } else {
                console.log("Navigation has failed!");
              }
            });
          },err => {
            console.log(err);
            this.alertService.danger('Service konnte nicht aktualisiert werden');
          });
      },
        err => {
           console.log(err);
           this.alertService.danger('Service konnte nicht angelegt werden');

        });


  }

}
