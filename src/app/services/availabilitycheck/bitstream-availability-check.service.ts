import { Injectable } from '@angular/core';
import {DSLRechercheAdresse,DslRechercheService} from '../../shared/dfc/dsl-abfrage/dsl-recherche.service';
import {NominatimService} from '../Nominatim/nominatim.service';
import { NominatimAddress } from '../../models/nominatim-address';
import { AlertService } from 'ngx-alerts';
import { BSAAbfrageProdukt } from '../../models';

import {throwError, Observable} from 'rxjs';
import {
  map
} from 'rxjs/operators';

import t from 'typy';

@Injectable({
  providedIn: 'root'
})
export class BitstreamAvailabilityCheckService {

  availableBSAProducts:Array<BSAAbfrageProdukt>=[];


  constructor(
    private dslRechercheService:DslRechercheService,
    private alertService:AlertService

  ) { }


  lookupDSLProdukt(address:NominatimAddress):Observable<Array<BSAAbfrageProdukt>>{

    //adress valid ?
    if (!this.rechercheAddressValid()){
      //console.log("Recherche-Adresse ungültig");
      this.alertService.warning("Recherche-Adresse ungültig");
      return;
    }


    //populate rechercheaddresse from formcontrol
    let addr = <DSLRechercheAdresse>{};
    addr.ort=address.city;
    addr.strasse=address.road;
    addr.hausnummer=address.house_number;
    addr.plz=address.postcode;
    this.availableBSAProducts=[];

    return this.dslRechercheService.addressSearch(addr).pipe(

      map(result => {
        return this.parseRechercheResult(result);
        }, () => {
          this.alertService.warning("DSL-Recherche-Fehler");
          }
      )

    );
  }

  private rechercheAddressValid():boolean{
        return true;
  }


  private parseRechercheResult(result){
        //const ergebnis = ((result || {}).Adresse_Response || {}).Ergebnis;
        const ergebnis = t(result, 'sucheMarktprodukt.Adressbezogen.Adresse_Response.Ergebnis').safeObject;
        //console.log(ergebnis);
        if (ergebnis === undefined){
           this.alertService.warning("DSL-Recherche-Ergebnis ungueltig");
           return;
        }
        switch (ergebnis.RueckmeldungSchluessel){
            case "10200":
            case "10201":
            case "10220":
            case "10221":
                return this.buildProductList(result);
            case "10002":
            case "10003":
            case "10004":
            case "10005":
                //this.populateRefineRecherche(result);
                throw throwError("Adresse nicht eindeutig");
                //break;
            case "10202":
            case "10203":
            case "10204":
                throw throwError("DSL-Recherche-Fehler: " + ergebnis.RueckmeldungText );
                //break;
            default:
                throw throwError("DSL-Recherche-Fehler: " + ergebnis.RueckmeldungText );
        }
    }

    private buildProductList(result){

        const response = t(result, 'sucheMarktprodukt.Adressbezogen.Adresse_Response').safeObject;
        let capacity = response['DSL-Kapazitaet'];
        this.availableBSAProducts=[];

        if (t(capacity.Produktliste).isDefined){
          for (let produkt of capacity.Produktliste) {
            let prod:BSAAbfrageProdukt = <BSAAbfrageProdukt>{};
            prod.materialNummer = produkt["Materialnummer"];
            prod.produktoptionName = produkt["Produkt"];
            this.availableBSAProducts.push(prod);
          }
        }
        return this.availableBSAProducts;
    }

}
