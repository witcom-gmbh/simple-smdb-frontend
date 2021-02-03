import { Injectable } from '@angular/core';
import { BitstreamAvailabilityCheckService } from './bitstream-availability-check.service';
import { DSLAMAvailabilityCheckService } from './dslamavailability-check.service';
import { NominatimAddress } from '../../models/nominatim-address';
import {
  map,
  merge,
  catchError
} from 'rxjs/operators';
import { forkJoin,Observable, BehaviorSubject, of } from 'rxjs';

import t from 'typy';
import { ServiceAccessObject, ServiceAccessSource } from '../../models';
import { HALwlCheckService } from './halwl-check.service';

@Injectable({
  providedIn: 'root'
})
export class ServiceAccessAvailabilityCheckService {

//es gibt noch paar mehr.... auch verschiedene Produkte die die gleiche Bandbreite anbieten
//sollte definitiv (extern) konfigurierbar sein
dslProduktMapping = [{
	"materialnummer": "89800055",
	"saSubType": "IPBSA_100_40"
}, {
	"materialnummer": "89743558",
	"saSubType": "IPBSA_16_1"
}, {
	"materialnummer": "89742311",
	"saSubType": "IPBSA_25_5"
}, {
	"materialnummer": "89742312",
	"saSubType": "IPBSA_50_10"
}];

  availableSAObjects:Array<ServiceAccessObject>=[];
  selectedAddress:NominatimAddress;

  private _UpdatedServiceAccessAvailability = new BehaviorSubject<Array<ServiceAccessObject>>([]);
  UpdatedServiceAccessAvailability = this._UpdatedServiceAccessAvailability.asObservable();

  private _UpdatedSelectedAdress = new BehaviorSubject<NominatimAddress>(null);
  UpdatedSelectedAdress = this._UpdatedSelectedAdress.asObservable();

  constructor(
    private bsaCheckService:BitstreamAvailabilityCheckService,
    private dslamCheckService:DSLAMAvailabilityCheckService,
    private halwlCheckService:HALwlCheckService
  ) { }

  setAvailableServiceAccessObjects(objects:Array<ServiceAccessObject>){
    this.availableSAObjects=objects;
    this._UpdatedServiceAccessAvailability.next(objects);
  }

  getAvailableServiceAccessObjects(){
    return this.availableSAObjects;
  }

  setSelectedAddress(address:NominatimAddress){
    this.selectedAddress=address;
    this._UpdatedSelectedAdress.next(address);
  }

  getSelectedAddress(){

    return this.selectedAddress;
  }

  checkAvailability(address:NominatimAddress):Observable<Array<ServiceAccessObject>>{

    //todo error-handling per call. Ein error darf nicht einen Fehler fuer alle abfragen ausloesen

    let bsaCheck = this.bsaCheckService.lookupDSLProdukt(address).pipe(
      map(bsaProdukte => {
        let saObjects:Array<ServiceAccessObject>=[];
        //map bsa-produkte auf erschliessungen
        for (let produkt of bsaProdukte) {
          //check if we can map the BSA-Product to our supported products
          let mapping = this.dslProduktMapping.filter(m => m.materialnummer==produkt.materialNummer);
          if (mapping.length==1){
            let saObject = <ServiceAccessObject>{};
            saObject.source=ServiceAccessSource.BSA_MKN;
            saObject.serviceAccessSubType=mapping[0].saSubType;
            saObject.name=produkt.materialNummer;
            saObject.description=produkt.produktoptionName;
            saObjects.push(saObject);
          }
        }

        return saObjects;
      })
    );
    //fake
    let dslamCheck = this.dslamCheckService.checkForDSLAM();
    let lwlCheck = this.halwlCheckService.checkForServiceAccess();

    return forkJoin(bsaCheck,dslamCheck,lwlCheck).pipe(
      catchError(err => {
        console.log(err);
        //this.alertService.warning("DSL-Recherche-Fehler");
        return of([]);
      }
      ),
      map(results => {
        let emptyArray:Array<ServiceAccessObject> = [];
        for (var result of results) {
          emptyArray =  emptyArray.concat(result);
        }
        //remove nulls
        return emptyArray.filter(Boolean);;
      }
      )
    )

  }

}
