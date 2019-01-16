import { ServiceItemDto,AttributeDto,CustomPropertyDto } from '../../../api/models';
import { ServiceItemService } from '../../../services/service-item.service';
//import { Select,DataValueDto,TextField,ValidateDto,BaseComponent,Button } from 'formio-schema';
import {
    DynamicInputControlModel,
    DynamicFormModel,
    DynamicCheckboxModel,
    DynamicInputModel,
    DynamicRadioGroupModel
} from "@ng-dynamic-forms/core";
//import BaseComponent from 'formiojs/components/base/Base';


import { UserVisibleAttributeFilterPipe,SplTranslatePipe } from '../../../shared/shared.module';


export abstract class AbstractBaseComponent {
    
    protected attribute:any;
    protected itemAttributes:Array<any>;
    protected serviceItem:ServiceItemDto;
    
    constructor(attribute:AttributeDto,itemAttributes:Array<any>,serviceItem:ServiceItemDto){
        //console.log(serviceItem);
        this.attribute = attribute;
        this.serviceItem = serviceItem;
        this.itemAttributes = itemAttributes;
    }
    
    abstract getDynamicModel():DynamicInputControlModel<any>;
    //abstract getComponent():BaseComponent;
    abstract getFormValue():any;
    
    getLabel():string{
        let f = new SplTranslatePipe();
        return f.transform(this.attribute.attributeDef.attributeDef.displayName);
    }
    
    getDescription():string{
        let f = new SplTranslatePipe();
        return f.transform(this.attribute.attributeDef.attributeDef.description);        
    }

    /**
     * Get Value-Object of EnumAttribute by Value-Systemname
     */
    getEnumAttributeValueByValue(value:string){
        return this.attribute.attributeDef.attributeType.values.find(a => a.value === value);      
    }
    
    /**
     * Get all EnumAttributeValues on an attribute
     * 
     */
    getEnumAttributeValues(){
        //console.log(attribute.attributeDef.attributeType.values);
        return this.attribute.attributeDef.attributeType.values;
    }
    
    /**
     * Get custom property of attribute by propertyName
     * 
     */
    getCustomPropertyByName(propertyName:string):CustomPropertyDto{
        let customProperties:any = this.attribute.attributeDef.attributeDef.customProperties;
        return customProperties.properties.find(i => i.name === propertyName);
    }
    
    /**
     * Cheks if Attribute-Value is stored as JSON
     * 
     */
    isAttributeStoredAsJSON():boolean{
        let filterProperty:CustomPropertyDto = this.getCustomPropertyByName('attributeStoredAsJson');
        if(filterProperty!==null){
              if(filterProperty.value==='true'){
                  return true;
              }
        }
        return false;
    }
    
    /**
     * Checks if attribute is required for service-item-status
     * 
     */
    isAttributeRequiredForStatus(status:string):boolean{
        let filterProperty:CustomPropertyDto = this.getCustomPropertyByName('attributeRequiredForStatus');
        if(filterProperty!==null){
              if(filterProperty.value===status){
                  return true;
              }
        
          }
        return false;
    }
    
}
