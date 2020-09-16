import { ServiceItemDto,AttributeDto,CustomPropertyDto } from '../../../api/models';
import { ServiceItemService } from '../../../services/service-item.service';
import t from 'typy';
import {ValueHandler} from '../value-handler.enum';
import {AttributeProcessor} from '../../../shared/attribute-processor-config';
//import { Select,DataValueDto,TextField,ValidateDto,BaseComponent,Button } from 'formio-schema';
import {
    DynamicInputControlModel,
    DynamicFormModel,
    DynamicCheckboxModel,
    DynamicInputModel,
    DynamicRadioGroupModel,
    DynamicFormValueControlModel
} from "@ng-dynamic-forms/core";
//import BaseComponent from 'formiojs/components/base/Base';


import { UserVisibleAttributeFilterPipe,SplTranslatePipe } from '../../../shared/shared.module';


export abstract class AbstractBaseComponent {

    protected attribute:any;
    //protected itemAttributes:Array<any>;
    protected serviceItem:ServiceItemDto;
    protected attributeValueHandler:ValueHandler;
    protected enabled:boolean=true;
    protected processor:AttributeProcessor;

    constructor(attribute:AttributeDto,processor:AttributeProcessor,serviceItem:ServiceItemDto){
        this.attribute = attribute;
        this.serviceItem = serviceItem;
        this.processor = processor;
    }

    AttributeValueHandler(handler:ValueHandler){
        this.attributeValueHandler=handler;
        return this;
    }

    protected getAttributeValueHandler():ValueHandler{
        //Non default ValueHandler ? then return it
        if(!t(this.attributeValueHandler).isNullOrUndefined){

            return this.attributeValueHandler;
        }
        //Return Default-Handlers from processor
        return this.processor.valueHandler

    }

    abstract getDynamicModel():DynamicFormValueControlModel<any>;
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

    Disabled():any{
      this.enabled=false;
      return this;
    }

    setDisabled():void{
      this.enabled=false;
    }
    /**
     * Checks if Attribute can be changed
     */
    canChangeAttribute():boolean{
        if (this.attribute.attributeDef.attributeDef.readonly === true){
            return false;

        }
        //Nur bei funktionalen attributen
        if(this.attribute.attributeDef.attributeDef.functionalType === "FUNCTIONAL"){
        if ((this.serviceItem.status !== "TEST") && (this.serviceItem.status !== "INWORK")){

            return false;
        }
        }

        return true;

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
     * Checks if attribute is required for service-item-status
     * ToDo - use rule/validation engine
     */
    isAttributeRequiredForStatus(status:string):boolean{
      return false;

    }

}
