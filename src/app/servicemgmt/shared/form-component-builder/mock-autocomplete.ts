import { AbstractBaseComponent } from './abstract-base-component';
import {MockApiSearchService} from '../../../services/mock-api-search.service'
import { Observable, observable, of } from 'rxjs';
import {
  startWith,
  map,
  debounceTime,
  mergeMapTo,
  mergeMap,
  switchMap,
  catchError
} from 'rxjs/operators';
import {
    DynamicInputControlModel,
    DynamicFormModel,
    DynamicCheckboxModel,
    DynamicInputModel,
    DynamicRadioGroupModel
} from "@ng-dynamic-forms/core";

import { Select,DataValueDto,TextField,ValidateDto,BaseComponent,Button } from 'formio-schema';


export class MockAutoCompleteComponent extends AbstractBaseComponent{
    
    //private searchService:MockApiSearchService;
    
    getDynamicContactModel(searchService:MockApiSearchService):DynamicInputControlModel<any>{
        
        // 
        //let model = this.getDynamicModel();
        let model = new DynamicInputModel({

            id: "attribute_"+this.attribute.name,
            label: this.getLabel(),
            value:this.getFormValue()
            
            //maxLength: 42,
            //placeholder: "Sample input"
        });

        model.list = searchService.search("http://apis.witcom-dev.services/api/persons",""); 
        //model.valueUpdates.pipe(map(v => return v)).subscribe(value => console.log("new value: ", value));
         
        
        let obs = model.valueUpdates.pipe(
        debounceTime(300),
        map(val => {
            
            if (val !== '') {
          // lookup from github
          console.log("lookup for ", val);
          //return of(null);
          //return this.lookup(value);
          return searchService.search("http://apis.witcom-dev.services/api/persons",""); 
        } else {
          // if no value is present, return null
          console.log("null ");
          return of(null);
        }
            
            //console.log(val);
            //return val;
        }));
        
        
        obs.subscribe(value => console.log("new value: ", value));
        
        
         
        /*
        model.valueUpdates.pipe(
        startWith(''),
      // delay emits
      debounceTime(300),
      // use switch map so as to cancel previous subscribed events, before creating new once
      switchMap(value => {
        if (value !== '') {
          // lookup from github
          console.log("lookup for ", value);
          //return of(null);
          //return this.lookup(value);
          return searchService.search("http://apis.witcom-dev.services/api/persons","value");
        } else {
          // if no value is present, return null
          console.log("null ");
          return of(null);
        }
      })
        );*/
        //res.subscribe(r => {console.log('was geht')});
        
        
        //console.log(res);         
        return model;
        
    }
    
    getDynamicModel():DynamicInputModel{
        
        
        let model = new DynamicInputModel({

            id: "attribute_"+this.attribute.name,
            label: this.getLabel(),
            value:this.getFormValue()
            
            //maxLength: 42,
            //placeholder: "Sample input"
        });
         
        if (this.isAttributeRequiredForStatus('requiredOffered')) {
            let validators = { required: null,minLength: 3};
            model.validators=validators;
            model.errorMessages= { required: "{{ label }} ist erforderlich." };
        }
        if (this.attribute.attributeDef.attributeType.mandatory === true){
            let validators = { required: null,minLength: 3};
            model.validators=validators;
            model.errorMessages= { required: "{{ label }} ist erforderlich." };
        }
        
        if (this.attribute.attributeDef.attributeDef.readonly === true){
            model.disabled=true;
        }
        
        return model;
    }
    
    getFormValue():any{
        if (this.isAttributeStoredAsJSON()){
                 return JSON.parse(this.attribute.value); 
        }
        return this.attribute.value; 
    }
}
