import { Component, OnInit } from '@angular/core';
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
import {ServiceSearchService,ServiceItemService,ServiceManagementService} from '@app/services/services';
import {
     ServiceItemDto,
} from '@app/api/models';


@Component({
  selector: 'simple-service-search',
  templateUrl: './simple-service-search.component.html',
  styleUrls: ['./simple-service-search.component.css']
})
export class SimpleServiceSearchComponent implements OnInit {

  public serviceAutoComplete$: Observable<ServiceItemDto> = null;
  public autoCompleteControl = new FormControl();

  constructor(

        private logger: NGXLogger,
        private alertService: AlertService,
        private serviceMgmt:ServiceManagementService,
        private serviceSearch: ServiceSearchService,
        private router: Router,
        private svcItemService: ServiceItemService

  ) { }

  ngOnInit() {

    this.serviceAutoComplete$ = this.autoCompleteControl.valueChanges.pipe(
      startWith(''),
      // delay emits
      debounceTime(300),
      // use switch map so as to cancel previous subscribed events, before creating new once
      switchMap(value => {
        if (value !== '') {
          // lookup from SMDB
          return this.serviceSearch.searchService(value);
        } else {
          // if no value is pressent, return null
          return of(null);
        }
      })
    );

  }

  clearSearchField(){

    this.autoCompleteControl.setValue(null);
  }

  displayFn(service?: ServiceItemDto): string | undefined {
    //console.log(product);
    if (t(service).isNullOrUndefined){
      return "";
    }
    return service.displayName + " - " + t(service.description).safeString;
  }

  openService(){

    this.router.navigate(['/service-config', this.autoCompleteControl.value.id]).then( (e) => {
      if (e) {
        console.log("Navigation is successful!");
      } else {
        console.log("Navigation has failed!");
      }
    });
  }


}
