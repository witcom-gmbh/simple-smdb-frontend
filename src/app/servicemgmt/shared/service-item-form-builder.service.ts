import { Injectable } from '@angular/core';
import { Observable,throwError  } from 'rxjs';
import { ServiceItemDto,AttributeDto,CustomPropertiesDto,CustomPropertyDto } from '../../api/models';
import {UserVisibleAttributeFilterPipe,SplTranslatePipe} from '../../shared/shared.module';
import {
    DynamicFormModel,
    DynamicCheckboxModel,
    DynamicInputModel,
    DynamicRadioGroupModel,
    DynamicInputControlModel
} from "@ng-dynamic-forms/core";
import {ServiceItemContactDFCControlModel} from "../../shared/dfc/dfc";
import { ServiceItemService } from '../../services/service-item.service';
import {MockApiSearchService} from '../../services/mock-api-search.service'
import  * as constants from '../../shared/constants.module';
import {TextComponent,TextAreaComponent,MockAutoCompleteComponent} from './form-component-builder/form-components';
import { SmdbConfig } from './smdb-config';


@Injectable({
  providedIn: 'root'
})
export class ServiceItemFormBuilder {
    
    private formModel : DynamicFormModel = [];
    private serviceItem:ServiceItemDto;

    constructor(
        private searchService:MockApiSearchService,
        private svcItemService:ServiceItemService
        ) {
    }
    
    getFormModel(serviceItem:ServiceItemDto):Observable<any>{
        this.serviceItem = serviceItem;
        
        let formObservable = new Observable((observer) => {
            
            
            this.svcItemService.getItemAttributes(this.serviceItem.id).subscribe(res => {
                let itemAttributes = res;
                
                this.formModel = [];
                
                let f = new UserVisibleAttributeFilterPipe();
                for (let attribute of f.transform(itemAttributes)){
                  console.log(attribute);

                  //this.formModel.push(this.getFakeModel());
                  switch(attribute._type){
                      case "AttributeEnumDto":
                        //formSpec.formDefinition.components.push(this.getEnumAttributeComponent(attribute));
                      break;
                      case "AttributeStringDto":
                        this.formModel.push(this.getStringAttributeComponent(attribute,itemAttributes));
                      break;
                  }

                }
                
                
                let test = new ServiceItemContactDFCControlModel({
                    id:"itemContactRelation",
                    itemId:this.serviceItem.id,
                    requiredContactRoles:['contactCommercial']
                }
                
                );
                console.log(test); 
                
                this.formModel.push(test); 
                
                
                observer.next(this.formModel);
                //observer.complete();
                //observer.error("fehler");
                observer.complete();
            }); 
 
    
            
        });
        

        
        
        return formObservable;
        
    }
    
    getFormSpec(serviceItem:ServiceItemDto): Observable<any>{
        this.serviceItem = serviceItem;
        
        
        let formModel : DynamicFormModel = [];   
            
        let formSpec:any = {submission:{'data':{}},formDefinition:{title:'Attribute Form',components:[],model:formModel }};
        let formObservable = new Observable((observer) => {
            
            this.svcItemService.getItemAttributes(this.serviceItem.id).subscribe(res => {
                let itemAttributes = res;
                
                var formModel : DynamicFormModel = [];
                
                let f = new UserVisibleAttributeFilterPipe();
                for (let attribute of f.transform(itemAttributes)){
                  //console.log(attribute);
                  switch(attribute._type){
                      /*
                      case "AttributeEnumDto":
                        formSpec.formDefinition.components.push(this.getEnumAttributeComponent(attribute));
                      break;*/
                      case "AttributeStringDto":
                        formSpec.formDefinition.model.push(this.getStringAttributeComponent(attribute,itemAttributes));
                      break;
                  }
                //formSpec.submission.data[attribute.name] = this.getAttributeValue(attribute);
                }
                
                //Contact-Selection
                //this.getContactSelectionComponent();
                
            });
            //console.log(formSpec);
            
            // observable execution
            observer.next(formModel);
            //observer.complete();
            //observer.error("fehler");
            observer.complete();
        })
    
      
        //  let formSpec:any = {submission:{'data':{}},formDefinition:{title:'Attribute Form',components:[]}};
        return formObservable;
  }
  
  private getContactSelectionComponent():any{
      let requiredRoles=[];
      //get required contact-roles
      let myStatus = "INWORK";
      let stateMapping = SmdbConfig.serviceItemStateMapping.find(m => m.state==myStatus);
      if (stateMapping !== undefined){
          
          let property = stateMapping.mappings.contactsRequiredProperty;
          let contactRequiredProperty = this.getProductItemCustomPropertyByName(this.serviceItem.productItem,property);
          if (contactRequiredProperty !== undefined){
              if(contactRequiredProperty.multiValue !== null){
                  requiredRoles=requiredRoles.concat(contactRequiredProperty.multiValue.values);
              }
          }
          //console.log(this.getProductItemCustomPropertyByName(this.serviceItem.productItem,property));
          //console.log(this.serviceItem); 
      }
      console.log(requiredRoles);
  }
  
  private getEnumAttributeComponent(attribute:any):any{
      
    return;
  }
  
  private getStringAttributeComponent(attribute:any,itemAttributes:Array<any>):any{
    
    let filterProperty:CustomPropertyDto = this.getCustomPropertyByName(attribute,constants.ATTRIBUTE_RENDERER);
    let renderer = this.getCustomPropertyValueByName(attribute,constants.ATTRIBUTE_RENDERER);
    
    if (renderer===null){
          return this.getDefaultStringAttributeComponent(attribute,itemAttributes); 
      }
    //let comp = new TextComponent(attribute,itemAttributes,this.serviceItem).getComponent();
    //let model = new TextComponent(attribute,itemAttributes,this.serviceItem).getDynamicModel(); 

    switch(renderer){
          case constants.ATTRIBUTE_RENDERER_CONTACT:
            //return this.getContactStringAttributeComponent(attribute); 
            return new MockAutoCompleteComponent(attribute,itemAttributes,this.serviceItem).getDynamicContactModel(this.searchService); ;
          case constants.ATTRIBUTE_RENDERER_COMPANY:
            //return this.getCompanyStringAttributeComponent(attribute); 
          default:
            return this.getDefaultStringAttributeComponent(attribute,itemAttributes); 
    }
       
    //return model;
  }
  
  private getDefaultStringAttributeComponent(attribute,itemAttributes:Array<any>):DynamicInputControlModel<any>{
      
      return new TextComponent(attribute,itemAttributes,this.serviceItem).getDynamicModel(); ;
      
      
  }  
  
  private getProductItemCustomPropertyByName(product:any,propertyName:string):any{
      let customProperties:any = product.customProperties;
      return customProperties.properties.find(i => i.name === propertyName);
  }
  
  private getCustomPropertyByName(attribute:AttributeDto,propertyName:string):CustomPropertyDto{
      let customProperties:CustomPropertiesDto = attribute.attributeDef.attributeDef.customProperties;
      return customProperties.properties.find(i => i.name === propertyName);
  }
  
  private getCustomPropertyValueByName(attribute:AttributeDto,propertyName:string):string{
      let customProperties:CustomPropertiesDto = attribute.attributeDef.attributeDef.customProperties;
      let property = customProperties.properties.find(i => i.name === propertyName);
      if (property === undefined) return undefined;
      return property.value;
  }
    
}
