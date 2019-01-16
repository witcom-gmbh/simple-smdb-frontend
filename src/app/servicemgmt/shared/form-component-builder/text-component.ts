import { AbstractBaseComponent } from './abstract-base-component';

import {
    DynamicInputControlModel,
    DynamicFormModel,
    DynamicCheckboxModel,
    DynamicInputModel,
    DynamicRadioGroupModel
} from "@ng-dynamic-forms/core";

import { Select,DataValueDto,TextField,ValidateDto,BaseComponent,Button } from 'formio-schema';


export class TextComponent extends AbstractBaseComponent{
    
    
    getDynamicModel():DynamicInputControlModel<any>{
        
        
        let model = new DynamicInputModel({

            id: this.attribute.name,
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
    
    getComponent():BaseComponent{
        
        let text = new TextField(this.attribute.name);
        text.label = this.getLabel();
        text.description = this.getDescription();
        
        //status muss aus service-item gelesen werden
        if (this.isAttributeRequiredForStatus('requiredOffered')){
            let validator = new ValidateDto();
            validator.required=true;
            validator.minLength=1;
            text.validate=validator; 
        }
      
        if (this.attribute.attributeDef.attributeDef.readonly === true){
            text.disabled=true;
        }

        if (this.attribute.attributeDef.attributeType.mandatory === true){
            let validator = new ValidateDto();
            validator.required=true;
            validator.minLength=1;
            text.validate=validator;
        }

        return text;
    }
    
    getFormValue():any{
        if (this.isAttributeStoredAsJSON()){
                 return JSON.parse(this.attribute.value); 
        }
        return this.attribute.value; 
    }
}
