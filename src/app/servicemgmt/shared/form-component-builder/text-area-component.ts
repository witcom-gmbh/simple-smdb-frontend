import { AbstractBaseComponent } from './abstract-base-component';

import {
    DynamicInputControlModel,
    DynamicFormModel,
    DynamicCheckboxModel,
    DynamicInputModel,
    DynamicTextAreaModel,
    DynamicRadioGroupModel
} from "@ng-dynamic-forms/core";


export class TextAreaComponent extends AbstractBaseComponent{
    
    
    getDynamicModel():DynamicInputControlModel<any>{
        
        
        let model = new DynamicTextAreaModel({

            id: this.attribute.name,
            label: this.getLabel(),
            value:this.getFormValue(),
            rows:5
            
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
