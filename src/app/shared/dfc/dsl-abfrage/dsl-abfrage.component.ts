import { Component, OnInit,OnChanges ,Input,ViewChild , Output,forwardRef  } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR , FormGroupDirective, NgForm,Validators} from '@angular/forms';
import {FormControl} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';
import {Observable,of} from 'rxjs';
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
import { MatAutocompleteModule,MatAutocomplete,MatInput,MatSelect,MatAutocompleteSelectedEvent,MatSelectChange  } from "@angular/material";
import {DSLRechercheAdresse,DslRechercheService} from './dsl-recherche.service';
import {NominatimService,GeocodeResponse,MessageService} from '../../../services/services';

export interface NominatimAddress {
    road: string;
    house_number:string;
    postcode:string;
    city:string;
    displayName:string;
    
    
}

export interface DSLAbfrageProdukt {
    materialNummer: string;
    produktoption:string;
    produktoptionName:string;
}

export interface DSLAbfrageResult {
    addresse: DSLRechercheAdresse;
    produkt: DSLAbfrageProdukt;
    availabilityChecked: boolean;
}
/*
export const dslProduktMapping = [{
	"materialnummer": "89800055",
	"produktoption": "bsa100_40",
	"produktoptionName": "100/40 MBit/s"
}, {
	"materialnummer": "89743558",
	"produktoption": "bsa16_1",
	"produktoptionName": "16/1 MBit/s"
}, {
	"materialnummer": "89742311",
	"produktoption": "bsa25_5",
	"produktoptionName": "25/5 MBit/s"
}];*/

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}


@Component({
  selector: 'dsl-abfrage',
  templateUrl: './dsl-abfrage.component.html',
  styleUrls: ['./dsl-abfrage.component.css'],
  providers: [
    { 
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DslAbfrageComponent), 
      multi: true
    }
  ] 
})
export class DslAbfrageComponent implements ControlValueAccessor, OnInit {
    
    abfrageResult:DSLAbfrageResult=null; 
    adressSearchControl = new FormControl();
    availableBSAProducts:Array<any>=[]; 
    controlDisabled:boolean=false;
   
    filteredAddresses : Observable<Array<GeocodeResponse>>;
    
    rechercheAdvanced:boolean=false;
    rechercheAddress : DSLRechercheAdresse = null;
    rechercheRunning:boolean=false;    
    
    rechercheRefined:boolean=false;
    rechercheRefinedAddressList:Array<any>=[];
    
    productAddress : DSLRechercheAdresse = null;
 
    selectedAddress : GeocodeResponse = null;
    selectedBSAProduct = null;
    selectedBSAProductAddress : DSLRechercheAdresse = null;
    
    @Input() selectableBSAProducts:Array<DSLAbfrageProdukt>;
    
    //Input-Controls
    strasseFormControl = new FormControl('', [
        Validators.required,
    ]);
    ortFormControl = new FormControl('', [
        Validators.required,
    ]);
    hausnummerFormControl = new FormControl('', [
        Validators.required,
        Validators.pattern(/^-?(0|[1-9]\d*)?$/),
        Validators.min(1),
        Validators.max(999999)
    ]);
    plzFormControl = new FormControl('', [
        Validators.required,
        Validators.pattern(/^-?(0|[1-9]\d*)?$/),
        Validators. minLength(5),
        Validators. maxLength(5)
    ]);
    hausnummerzusatzFormControl = new FormControl('');
    klsFormControl = new FormControl('',[
        Validators.pattern(/^-?(0|[1-9]\d*)?$/)
    ]);
     
    matcher = new MyErrorStateMatcher();

    constructor(
    private nominatimService:NominatimService,
    private dslRechercheService:DslRechercheService,
    private messageService:MessageService
    ) { }

    ngOnInit() {
        //this.availableBSAProducts=[ { "materialnummer": "89800055", "produktoption": "bsa100_40", "produktoptionName": "100/40 MBit/s" }, { "materialnummer": "89742311", "produktoption": "bsa25_5", "produktoptionName": "25/5 MBit/s" }, { "materialnummer": "89743558", "produktoption": "bsa16_1", "produktoptionName": "16/1 MBit/s" } ];
        
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
                    return simpleAddr;}
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
    
    lookupDSLProdukt(){
        if (!this.rechercheAddressValid()){ 
            console.log("Recherche-Adresse ungültig");
            this.messageService.add("Recherche-Adresse ungültig");
            return;
        }
        //populate rechercheaddresse from formcontrol
        let addr = <DSLRechercheAdresse>{};
        /*
        addr.strasse = this.selectedAddress.address,road;
        addr.hausnummer=this.selectedAddress.address,house_number;
        addr.plz=this.selectedAddress.address,postcode;
        addr.ort=this.selectedAddress.address,city;
        */
        //addr.strasse = this.selectedAddress.address,road;
        addr.ort=this.ortFormControl.value;
        addr.strasse=this.strasseFormControl.value;
        addr.hausnummer=this.hausnummerFormControl.value;
        addr.plz=this.plzFormControl.value;
        addr.hausnummernzusatz=this.hausnummerzusatzFormControl.value;
        addr.kls=this.klsFormControl.value;
        
        this.availableBSAProducts=[];
        this.rechercheRefinedAddressList=[];
        this.rechercheRunning=true;
        this.dslRechercheService.addressSearch(addr).subscribe(
        response => {
            console.log(response);
            if (response.hasOwnProperty('error')){
               this.messageService.add(response.error); 
            } else {
                //
                this.parseRechercheResult(response);
            }
            this.rechercheRunning=false;
            console.log('done');
        },
        err => {this.messageService.add(err);this.rechercheRunning=false;}
        );        
    }
    
    rechercheAddressValid():boolean{
        if (this.strasseFormControl.errors){return false;}
        if (this.hausnummerFormControl.errors){return false;}
        if (this.hausnummerzusatzFormControl.errors){return false;}
        if (this.plzFormControl.errors){return false;}
        if (this.ortFormControl.errors){return false;}
        return true; 
    }
    
    parseRechercheResult(result){
        //const ergebnis = ((result || {}).Adresse_Response || {}).Ergebnis;
        const ergebnis = t(result, 'sucheMarktprodukt.Adressbezogen.Adresse_Response.Ergebnis').safeObject;
        console.log(ergebnis);
        if (ergebnis === undefined){
           this.messageService.add("Recherche-Ergebnis ungueltig"); 
           return; 
        }
        switch (ergebnis.RueckmeldungSchluessel){
            case "10200":
            case "10201":            
            case "10220":                        
            case "10221":                        
                this.populateDSLProdukte(result);
                break;
            case "10002":
            case "10003":
            case "10004":
            case "10005":
                this.populateRefineRecherche(result);
                break;            
            case "10202":
            case "10203":            
            case "10204":            
                this.messageService.add("Negatives Recherche-Ergebnis: " + ergebnis.RueckmeldungText ); 
                break;                
            default:
                this.messageService.add("Recherche-Ergebnis: " + ergebnis.RueckmeldungText ); 
        }
    }
    
    onAddressSelectionChanged(event: MatAutocompleteSelectedEvent):void{
        //populate advanced search
        console.log(event.option.value); 
        if(!event.option.value.city){
                this.rechercheAdvanced = true;
        }
        if(!event.option.value.house_number){
            this.rechercheAdvanced = true;
        }
        
        this.strasseFormControl.setValue(event.option.value.road);
        this.hausnummerFormControl.setValue(event.option.value.house_number);
        this.plzFormControl.setValue(event.option.value.postcode);
        this.ortFormControl.setValue(event.option.value.city);
        
    }
    onRechercheRefinedSelection(event: MatSelectChange):void{
        //populate advanced search
        this.strasseFormControl.setValue(event.value.Strasse);
        this.hausnummerFormControl.setValue(event.value.Hausnummer);
        this.hausnummerzusatzFormControl.setValue(event.value.Hausnummernzusatz);
        this.plzFormControl.setValue(event.value.Postleitzahl);
        this.ortFormControl.setValue(event.value.Ort);
        this.klsFormControl.setValue(event.value["KLS-ID"]);
        //clear refined results
        this.rechercheRefinedAddressList = [];
        this.rechercheRefined=false;
        this.rechercheAdvanced=true; 
        
    }
    
    
    selectBSAProduct(event: MatSelectChange):void{
        if (this.selectedBSAProduct){
            this.abfrageResult = {addresse:this.productAddress,produkt:this.selectedBSAProduct,availabilityChecked:true};;
            //let value = {addresse:this.productAddress,produkt:this.selectedBSAProduct,availabilityChecked:true};
            console.log(this.abfrageResult);
            this.propagateChange(this.abfrageResult);
        }

    }
    
    setDisabledState( isDisabled : boolean ) : void {
        if(isDisabled){
            this.controlDisabled=true;
            
        } else {
            this.controlDisabled=false;
        }
    }



  
    populateDSLProdukte(result){
        const response = t(result, 'sucheMarktprodukt.Adressbezogen.Adresse_Response').safeObject;
        let adresse = response.Adresse;
        this.productAddress = <DSLRechercheAdresse>{}; 
        this.productAddress.strasse=adresse.Strasse;
        this.productAddress.hausnummer=adresse.Hausnummer;
        this.productAddress.hausnummernzusatz=(adresse.Hausnummernzusatz === undefined) ? "" : adresse.Hausnummernzusatz;;
        this.productAddress.ort=adresse.Ort;
        this.productAddress.ortsteil=(adresse.Ortsteil === undefined) ? "" : adresse.Ortsteil;
        this.productAddress.plz=adresse.Postleitzahl;
        this.productAddress.kls=adresse["KLS-ID"]; 
        
        
        //this.productAddress = response.Adresse;
        //console.log(adresse);
        let capacity = response['DSL-Kapazitaet'];
        this.availableBSAProducts=[];
        //console.log(response);
        if ((capacity.Produktliste !== undefined) && (this.selectableBSAProducts !== undefined)){
           	for (let produkt of capacity.Produktliste) {
                //console.log(produkt);
                let mappedProduktOption = this.selectableBSAProducts.find(m => m.materialNummer==produkt.Materialnummer);
                if (mappedProduktOption){
                    //console.log(mappedProduktOption);
                    this.availableBSAProducts.push(mappedProduktOption);
                    //this.requiredContactTypes.push(mappedContactType);
                }
            }
        }

        if (this.availableBSAProducts.length==0){
            this.messageService.add("Keine BSA-Produkte gefunden");  
            
        }
        console.log("available bsa-products ",this.availableBSAProducts); 
        
    }
    
    populateRefineRecherche(result){
        console.log("Suche verfeinern"); 
        const addrList = t(result, 'sucheMarktprodukt.Adressbezogen.Adresse_Response.AdressTreffer').safeObject;
        if (addrList === undefined){
            this.messageService.add("Recherche-Ergebnis nicht eindeutig, aber keine Auswahl an Ergebnissen erhalten"); 
            return;
        }
        this.rechercheRefinedAddressList = addrList;
        this.rechercheRefined=true;
 
        console.log(this.rechercheRefinedAddressList);
        
    }

    
    propagateChange = (_: any) => {};
    
    registerOnChange(fn) {
        this.propagateChange = fn;
    }
    
    registerOnTouched() {}
    
    writeValue(value: any) {

        if (t(value).isNullOrUndefined){
            return;
        }
        this.abfrageResult =value;
        if(t(value.addresse).isObject){
        this.strasseFormControl.setValue(value.addresse.strasse);
        this.hausnummerFormControl.setValue(value.addresse.hausnummer);
        this.hausnummerzusatzFormControl.setValue(value.addresse.hausnummernzusatz);
        this.plzFormControl.setValue(value.addresse.plz);
        this.ortFormControl.setValue(value.addresse.ort);
        this.klsFormControl.setValue(value.addresse.kls);
        }

        //this.productAddress=value.addresse;
    }

}

