import { AbstractBaseComponent } from './abstract-base-component';
import t from 'typy';
import {
    DynamicInputControlModel,
    DynamicFormModel,
    DynamicCheckboxModel,
    DynamicInputModel,
    DynamicRadioGroupModel
} from "@ng-dynamic-forms/core";

import { Select,DataValueDto,TextField,ValidateDto,BaseComponent,Button } from 'formio-schema';


export class TextComponent extends AbstractBaseComponent{
    
    private attributeRules=null;
    

    
    getDynamicModel():DynamicInputControlModel<any>{
        
        
        let model = new DynamicInputModel({

            id: "attribute_"+this.attribute.name,
            label: this.getLabel(),
            value:this.getFormValue(),
            additional:{
                type:"attribute",
                attribute:this.attribute,
                attributeValueHandler:this.getAttributeValueHandler()
            }

            
            //maxLength: 42,
            //placeholder: "Sample input"
        });
        model.validators={};
        //custom validators
        if(!t(this.attributeRules).isEmptyArray) {
            console.log("rules ",this.attributeRules);
            const validators = { };
            for (let rule of this.attributeRules){
                model.validators[rule.validationType]=null;
                
            }
            //model.validators=validators;
        }
        
        if (this.attribute.attributeDef.attributeType.mandatory === true){
            //let validators = { required: null,minLength: 3};
            model.validators["required"]=null;
            model.errorMessages= { required: "{{ label }} ist erforderlich." };
        }
        
        if (!this.canChangeAttribute()){
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
    
    AttributeRules(rules):any{
        
        this.attributeRules=rules.filter(r=>r.attributeName==this.attribute.name);
        return this;
    }
}
