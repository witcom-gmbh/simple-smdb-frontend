import { AbstractBaseComponent } from './abstract-base-component';
import t from 'typy';
import {
    DynamicInputControlModel,
    DynamicFormModel,
    DynamicCheckboxModel,
    DynamicInputModel,
    DynamicTextAreaModel,
    DynamicRadioGroupModel,
    DynamicSwitchModel
} from "@ng-dynamic-forms/core";
import { ValueHandler } from '../value-handler.enum';


export class SwitchComponent extends AbstractBaseComponent{

    private attributeRules=null;


    getDynamicModel():DynamicSwitchModel{


        let model = new DynamicSwitchModel({

            id: "attribute_"+this.attribute.name,
            offLabel: this.getLabel(),
            onLabel: this.getLabel(),
            //labelPosition:
            //label: this.getLabel(),
            value:this.getFormValue(),
            additional:{
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
      if (handler==ValueHandler.BOOLEAN_NUMBER_HANDLER){
        if (this.attribute.value==1){
          return true;
        }
        return false;
      }
      if (this.attribute.value == "null"){
        return false;
      }
      //Todo: map y,n, true, TRUE, etc.
      return true;
    }

    AttributeRules(rules):any{

        this.attributeRules=rules.filter(r=>r.attributeName==this.attribute.name);
        return this;
    }

}
