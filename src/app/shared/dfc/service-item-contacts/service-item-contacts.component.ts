import { Component, OnInit,OnChanges ,Input,ViewChild , Output,forwardRef  } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {FormControl} from '@angular/forms';
import {Observable,of} from 'rxjs';
import {
  startWith,
  map,
  debounceTime,
  mergeMapTo,
  mergeMap,
  switchMap,
  catchError
} from 'rxjs/operators';
import { MatAutocompleteModule,MatAutocomplete,MatInput,MatSelect,MatAutocompleteSelectedEvent  } from "@angular/material";

import { ServiceItemService } from '../../../services/service-item.service';
import { SmdbPartnerService} from '../../../services/smdb-partner.service';
import {MockApiSearchService} from '../../../services/mock-api-search.service';
import { ContactRelationDto,ServiceItemDto,AttributeDto,ContactTypeDto,PartnerDto,ContactDto } from '../../../api/models';
import {CONTACT_TYPES} from './contact-types';

@Component({
  selector: 'service-item-contacts',
  templateUrl: './service-item-contacts.component.html',
  styleUrls: ['./service-item-contacts.component.css'],
  providers: [
    { 
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ServiceItemContactsComponent),
      multi: true
    }
  ]
})
export class ServiceItemContactsComponent implements ControlValueAccessor, OnInit  {

    contactControl = new FormControl();
    filteredPartners : Observable<Array<PartnerDto>>;  

    @Input() itemId:number;

    newRoleControl = new FormControl([]);
    
    @Input() requiredContactRoles:string[];
    requiredContactTypes: ContactTypeDto[] =[];
    roles: ContactTypeDto[] = CONTACT_TYPES;
    
    partnerControl = new FormControl();
    partnerContacts:Observable<Array<ContactDto>>;
    
    @ViewChild("matAutocomplete") matAutocomplete: MatAutocomplete;
    @ViewChild(MatInput) matInput: MatInput;


    private itemContactRelations:Array<ContactRelationDto>;    
    constructor(
        private svcItemService:ServiceItemService,
        private searchService:MockApiSearchService,
        private smdbPartnerService: SmdbPartnerService
    ) {
        

    }
    
    ngAfterViewInit(){
        console.log("test",this.itemId); 
        
    }
    
    
    
    ngOnInit() {
        console.log("got input item id" , this.itemId);
        if(this.itemId !== undefined){
            this.getContactRelations();
        }
        this.buildRequiredContactTypes();
        
        this.filteredPartners = this.partnerControl.valueChanges.pipe(
          startWith(<string|PartnerDto>''),
          // delay emits
          debounceTime(300),
          // use switch map so as to cancel previous subscribed events, before creating new once
          switchMap(value => {
              //console.log(value);
              //let val = value as string;
            if (value !== '') {
                if (typeof value === 'string'){
                   return this.lookupPartners(value); 
                } else {
                   return  of([value]); 
                }
            } else {
                this.partnerContacts=of(null);
                this.contactControl.setValue(null);
                return of(null);
            }
          })
         );
        
    }

/*
    ngOnInit() {
        console.log("got input item id" , this.itemId);
        
      //this.getContactRelations();
      //this.buildRequiredContactTypes();
      
      this.filteredPartners = this.partnerControl.valueChanges.pipe(
      startWith(<string|PartnerDto>''),
      // delay emits
      debounceTime(300),
      // use switch map so as to cancel previous subscribed events, before creating new once
      switchMap(value => {
          //console.log(value);
          //let val = value as string;
        if (value !== '') {
            if (typeof value === 'string'){
               return this.lookupPartners(value); 
            } else {
               return  of([value]); 
            }
        } else {
            this.partnerContacts=of(null);
            this.contactControl.setValue(null);
            return of(null);
        }
      })
      );
      

    }*/
    
    addContactDisabled():boolean{
        
        if (this.newRoleControl.value == null){
            return true;
        }
        
        if (this.newRoleControl.value.length == 0){
            return true;
        }
        if ((this.contactControl.value===null)||(this.contactControl.value==="")){
            return true;
            
        }
        if (typeof this.contactControl.value === 'string'){
            
            return true;
        }
        return false;
    }
    
    addContactToServiceItem():void{
        let newRelation = <ContactRelationDto>{};
        newRelation._type="ContactRelationDto";
        newRelation.contact = this.contactControl.value;
        newRelation.contactTypes=this.newRoleControl.value;
        
        let modifiedRelations = JSON.parse(JSON.stringify(this.itemContactRelations));
        modifiedRelations.push(newRelation);
        this.svcItemService.replaceContactRelations(this.itemId,modifiedRelations).subscribe(res => {
            this.itemContactRelations = res;
            this.contactControl.setValue(null);
            this.newRoleControl.setValue(null);
        });
    }
    
    buildRequiredContactTypes(){
        if(!Array.isArray(this.requiredContactRoles)){
            return;
            
        }
        for (let role of this.requiredContactRoles) {
            console.log(role);
            let mappedContactType = this.roles.find(cType => cType.name==role);
            if (mappedContactType){
                //console.log(mappedContactType);
                this.requiredContactTypes.push(mappedContactType);
            }
        }
        
    }
    
    displayContactFn(contact?: ContactDto): string | undefined {
        return contact ? contact.firstname + ' ' + contact.lastname  : undefined; 
    }


    displayPartnerFn(partner?: PartnerDto): string | undefined {
        return partner ? partner.name  : undefined;
    }
    
    removeContactFromServiceItem(contactId):void{
        let modifiedRelations = this.itemContactRelations.filter(function( obj ) {
            return obj.contact.id !== contactId;
        });
        
        this.svcItemService.replaceContactRelations(this.itemId,modifiedRelations).subscribe(res => {
            this.itemContactRelations = res;
        });
    }
    
    
    
    /*
    filterContacts(value:string):ContactDto[]{
       const filterValue = value.toLowerCase();
       
       return this.partnerContacts;
       //return this.partnerContacts.filter(contact => contact.lastname.toLowerCase().includes(filterValue));
    }*/
    
    getContactRelations(){
        this.svcItemService.getContactRelations(this.itemId).subscribe(res => {this.itemContactRelations = res});
        
    }
    
    
    lookupContacts(value: string): Observable<any> {
        
        let partnerId = this.partnerControl.value.id;
        console.log(partnerId);
        if (partnerId === undefined) {return of(null);}
        
        return this.smdbPartnerService.lookupContactByPartner(partnerId,value.toLowerCase()).pipe(
          // map the item property of the github results as our return object
          map(results => results),
          // catch errors
          catchError(_ => {
            return of(null);
          })
        );
    }
    
    lookupPartners(value: string): Observable<PartnerDto> {
        return this.smdbPartnerService.lookupPartner(value.toLowerCase()).pipe(
          map(results => results),
          // catch errors
          catchError(_ => {
            return of(null);
          })
        );
    }
    
    onPartnerSelectionChanged(event: MatAutocompleteSelectedEvent) {
        console.log(event.option.value);
        this.partnerContacts=this.smdbPartnerService.getContactsByPartner(event.option.value.id)
        .pipe(map(result => result.contacts));

    }
    
    propagateChange = (_: any) => {};
    
    
    registerOnChange(fn) {
        this.propagateChange = fn;
    }
    
    registerOnTouched() {}
    
    writeValue(value: any) {
        //do nothing
    }

    
    
}
