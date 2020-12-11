import { AbstractBaseComponent } from './abstract-base-component';
import t from 'typy';
import {
    DynamicInputControlModel,
    DynamicFormModel,
    DynamicCheckboxModel,
    DynamicInputModel,
    DynamicTextAreaModel,
    DynamicRadioGroupModel
} from "@ng-dynamic-forms/core";
import { ValueHandler } from '../value-handler.enum';


export class TextAreaComponent extends AbstractBaseComponent{

    private attributeRules=null;


    getDynamicModel():DynamicTextAreaModel{


        let model = new DynamicTextAreaModel({

            id: "attribute_"+this.attribute.name,
            label: this.getLabel(),
            value:this.getFormValue(),
            rows:5,
            additional:{
                cdkAutosizeMinRows:false,
                type:"attribute",
                attribute:this.attribute,
                attributeValueHandler:this.getAttributeValueHandler()
            }
        });

        model.validators={};
        //custom validators
        if(!t(this.attributeRules).isEmptyArray) {
            //console.log("rules ",this.attributeRules);
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
      let handler = this.getAttributeValueHandler();
      if (handler==ValueHandler.JSON_STRING_HANDLER){
        return JSON.parse(this.attribute.value);
      }
      if (this.attribute.value == "null"){
        return "";
      }
      return this.attribute.value;
    }

    AttributeRules(rules):any{

        this.attributeRules=rules.filter(r=>r.attributeName==this.attribute.name);
        return this;
    }

}
