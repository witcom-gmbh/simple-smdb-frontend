import { Component, OnInit } from '@angular/core';
import {NominatimService,GeocodeResponse} from '../../services/services';
import {DSLAMAvailabilityCheckService,BitstreamAvailabilityCheckService,ServiceAccessAvailabilityCheckService} from '../../services/services';

import { NominatimAddress } from '../../models/nominatim-address';
import { AlertService } from 'ngx-alerts';
import { ControlValueAccessor, NG_VALUE_ACCESSOR , FormGroupDirective, NgForm,Validators} from '@angular/forms';
import {FormControl} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {Observable,of} from 'rxjs';
import {MatFormFieldModule} from '@angular/material/form-field';
import t from 'typy';
import {
  startWith,
  map,
  debounceTime,
  mergeMapTo,
  mergeMap,
  switchMap,
  catchError
} from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { ServiceAccessObject } from '../../models';

@Component({
  selector: 'service-access-availability-check',
  templateUrl: './service-access-availability-check.component.html',
  styleUrls: ['./service-access-availability-check.component.css']
})
export class ServiceAccessAvailabilityCheckComponent implements OnInit {

  adressSearchControl = new FormControl();
  filteredAddresses : Observable<Array<GeocodeResponse>>;
  rechercheRunning:boolean=false;

  selectedAddress: NominatimAddress;
  serviceAccessAvailable: Array<ServiceAccessObject>;

  constructor(
    private saCheckService: ServiceAccessAvailabilityCheckService,
    private dslamCheck: DSLAMAvailabilityCheckService,
    private bsaCheck: BitstreamAvailabilityCheckService,
    private alertService: AlertService,
    private nominatimService:NominatimService
  ) {

  }

    ngOnInit() {
        //this.availableBSAProducts=[ { "materialnummer": "89800055", "produktoption": "bsa100_40", "produktoptionName": "100/40 MBit/s" }, { "materialnummer": "89742311", "produktoption": "bsa25_5", "produktoptionName": "25/5 MBit/s" }, { "materialnummer": "89743558", "produktoption": "bsa16_1", "produktoptionName": "16/1 MBit/s" } ];

        this.selectedAddress=this.saCheckService.getSelectedAddress();
        this.serviceAccessAvailable = this.saCheckService.getAvailableServiceAccessObjects();

        this.filteredAddresses = this.adressSearchControl.valueChanges.pipe(
          startWith(<string|NominatimAddress>''),
          // delay emits
          debounceTime(300),
          // use switch map so as to cancel previous subscribed events, before creating new once
          switchMap(value => {
              //let val = value as string;
            if (value !== '') {
                if (typeof value === 'string'){
                   return this.lookupAddress(value);
                } else {
                   return  of([value]);
                }
            } else {
                this.adressSearchControl.setValue(null);
                return of(null);
            }
          })
         );

    }

    displayAddressFn(response?: NominatimAddress): string | undefined {

        if (response){
            if(response.city === undefined){
                response.city = "";
            }
            if(response.house_number === undefined){
                response.house_number = "";
            }
            let displayString = response.road +' ' + response.house_number + ', ' +response.postcode + ' ' +response.city;
            return displayString;
        } else {
            return undefined;

        }


        //return response ? response.address.road + ' ' + response.address.house_number +', '+ response.address.postcode + ' ' + response.address.city  : undefined;
    }


    lookupAddress(value: string): Observable<NominatimAddress> {
        return this.nominatimService.addressSearch(value.toLowerCase()).pipe(
            map(res => {
                return res.map(addr => {
                    let simpleAddr = <NominatimAddress>{};
                    simpleAddr.displayName = addr.display_name;
                    simpleAddr.road = addr.address.road;
                    simpleAddr.house_number = addr.address.house_number;
                    simpleAddr.postcode = addr.address.postcode;
                    simpleAddr.city = addr.address.city;
                    if (addr.address.town !==undefined) {simpleAddr.city=addr.address.town};
                    if (addr.address.village !==undefined && !simpleAddr.city) {simpleAddr.city=addr.address.village};
                    if (addr.address.hamlet !==undefined && !simpleAddr.city ) {simpleAddr.city=addr.address.hamlet};
                    return simpleAddr;
                  }
                )
                //console.log(res);
                //return res;
            }),
          // catch errors
          catchError(_ => {
            return of(null);
          })
        );
    }

    onAddressSelectionChanged(event: MatAutocompleteSelectedEvent):void{

      this.selectedAddress = event.option.value;
      this.saCheckService.setSelectedAddress(this.selectedAddress);

    }

    rechercheAddressValid():boolean{

      if (this.selectedAddress == null){
        return false;
      }

      if(t(this.selectedAddress.road).isEmptyString){
        return false;
      }
      if(t(this.selectedAddress.city).isEmptyString){
        return false;
      }
      /*
      if(t(this.selectedAddress.house_number).isEmptyString){
        return false;
      }
      */
      if(t(this.selectedAddress.postcode).isEmptyString){
        return false;
      }

      return true;
    }

  availablilityLookup(){

    if (!this.rechercheAddressValid){
      return;
    }
    this.rechercheRunning=true;
    /*
    let addr:NominatimAddress = <NominatimAddress>{};
    addr.city="Wiesbaden";
    addr.road="Tannenring";
    addr.house_number="56";
    addr.postcode="65207";
    */


    this.saCheckService.checkAvailability(this.selectedAddress).subscribe(res => {
      console.log(res);
      this.rechercheRunning=false;
      this.serviceAccessAvailable = res;

      this.saCheckService.setAvailableServiceAccessObjects(res);
    },err=>{
      console.log(err);
      this.alertService.warning(err);
      this.rechercheRunning=false;
    });


  }

}
