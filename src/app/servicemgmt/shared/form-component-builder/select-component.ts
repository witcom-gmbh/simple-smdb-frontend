import { AbstractBaseComponent } from './abstract-base-component';

import {
    DynamicInputControlModel,
    DynamicFormModel,
    DynamicCheckboxModel,
    DynamicInputModel,
    DynamicRadioGroupModel,
    DynamicSelectModel
} from "@ng-dynamic-forms/core";

export class SelectComponent extends AbstractBaseComponent{


    getDynamicModel():DynamicSelectModel<any>{


        //get option values
        const valueList:any = this.attribute.attributeDef.attributeType.values
        //sort by position
        .sort((a, b) => (a.position > b.position) ? 1 : -1)
        //only relevant parts
        .map(function (val){

          let dv = {"label":val.displayValue.defaultText,"value":val.value};
          return dv;

        });
        //attributeDef.attributeDef.functionalType


        let model = new DynamicSelectModel<string>({

            id: "attribute_"+this.attribute.name,
            label: this.getLabel(),
            value:this.getFormValue(),
            multiple: false,
            additional:{
                type:"attribute",
                attribute:this.attribute,
                attributeValueHandler:this.getAttributeValueHandler()
            },

            options:valueList

        });

        if (!this.canChangeAttribute()){
            model.disabled=true;
        }

        //Validierungen
        if (this.attribute.attributeDef.attributeDef.functionalType=="FUNCTIONAL"){
            let validators = { required: null};
            model.validators=validators;
            model.errorMessages= { required: "{{ label }} ist erforderlich." };

        }

        return model;
    }


    getFormValue():any{
        return this.attribute.values[0].value;
    }
}
