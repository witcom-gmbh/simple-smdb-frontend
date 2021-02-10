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


export class NumberComponent extends AbstractBaseComponent{

    private attributeRules=null;



    getDynamicModel():DynamicInputControlModel<any>{

        //console.log(this.attribute.attributeDef.attributeType);
        let model = new DynamicInputModel({

            id: "attribute_"+this.attribute.name,
            label: this.getLabel(),
            inputType: "number",
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
        model.errorMessages= [];
        if (!t(this.attribute,'attributeDef.attributeType.minValue').isNullOrUndefined){
          model.min = this.attribute.attributeDef.attributeType.minValue;
          model.validators["min"]=model.min;
          model.errorMessages["min"]= "Wert darf nicht kleiner als {{ min }} sein" ;
        }
        if (!t(this.attribute,'attributeDef.attributeType.maxValue').isNullOrUndefined){
          model.max = this.attribute.attributeDef.attributeType.maxValue;
          model.validators["max"]=model.max;
          model.errorMessages["max"]= "Wert darf nicht größer als {{ max }} sein" ;
        }
        //console.log(model);


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
            model.errorMessages["required"] = "{{ label }} ist erforderlich." ;
        }

        if (!this.canChangeAttribute()){
            model.disabled=true;
        }
        return model;
    }

    getFormValue():any{
      if (t(this.attribute.value).isNullOrUndefined){
        return this.attribute.attributeDef.attributeType.defaultValue;
      }
      return this.attribute.value;
    }

    AttributeRules(rules):any{

        this.attributeRules=rules.filter(r=>r.attributeName==this.attribute.name);
        return this;
    }
}
