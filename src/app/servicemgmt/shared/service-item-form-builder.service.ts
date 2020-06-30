import { Injectable } from '@angular/core';
import { Observable,throwError  } from 'rxjs';
import t from 'typy';
import { NGXLogger } from 'ngx-logger';
import { ServiceItemDto,AttributeDto,CustomPropertiesDto,CustomPropertyDto,ContactRelationDto,ServiceItemMultiplicityDto } from '../../api/models';
import {UserVisibleAttributeFilterPipe,SplTranslatePipe} from '../../shared/shared.module';
import {
    DynamicFormModel,
    DynamicCheckboxModel,
    DynamicInputModel,
    DynamicRadioGroupModel,
    DynamicInputControlModel,
    DynamicSelectModel,
    DynamicFormGroupModel,
    DynamicFormValueControlModel,
    DynamicSwitchModel
} from "@ng-dynamic-forms/core";

import {
    DynamicDslAbfrageControlModel,
    DSLAbfrageProdukt,
    ServiceItemContactDFCControlModel,
    serviceContactsValidator
} from '../../shared/dfc/dfc';
import { ServiceItemService } from '../../services/service-item.service';
import {MockApiSearchService} from '../../services/mock-api-search.service'
import  * as constants from '../../shared/constants.module';
import {TextComponent,TextAreaComponent,MockAutoCompleteComponent,SelectComponent} from './form-component-builder/form-components';
import { SmdbConfig } from './smdb-config';
import {ValueHandler} from './value-handler.enum';

export interface AttributeSaveData {
    attribute:AttributeDto;
    extendedConfig:any;
}

export interface ServiceItemSaveData {
    serviceItem:ServiceItemDto,
    itemAttributes:Array<AttributeDto>
}


@Injectable({
  providedIn: 'root'
})
export class ServiceItemFormBuilder {

    private formModel : DynamicFormModel = [];

    private serviceItem:ServiceItemDto;
    private itemAttributes:any=null;
    private contactRelations:Array<ContactRelationDto>=[];
    private serviceTransition:any;
    private requiredContactTypes:Array<string>=[];
    private attributeValidationRules:any = null;

    constructor(
        private logger: NGXLogger,
        private searchService:MockApiSearchService,
        private svcItemService:ServiceItemService
        ) {
    }

    getFormModelForAttributes():Observable<any>{
        let formModel : DynamicFormModel = [];
        let formObservable = new Observable((observer) => {
            if (t(this.serviceItem).isNullOrUndefined){
                observer.error("Service-Item not set");
            } else if(t(this.itemAttributes).isNullOrUndefined){
                observer.error("Service-Item-Attributes not set");
            } else {
                this.buildValidationRules();
                let f = new UserVisibleAttributeFilterPipe();
                for (let attribute of f.transform(this.itemAttributes)){
                  console.log(attribute);
                  switch(attribute._type){
                      case "AttributeEnumDto":
                        //formSpec.formDefinition.components.push(this.getEnumAttributeComponent(attribute));
                        formModel.push(this.getEnumAttributeComponent(attribute,this.itemAttributes));
                      break;
                      case "AttributeStringDto":
                        formModel.push(this.getStringAttributeComponent(attribute,this.itemAttributes));
                      break;
                      default:
                        console.warn("Unknown attributetype " + attribute._type);
                  }

                }
                observer.next(formModel);
                observer.complete();
            }
        });
        return formObservable;
    }

    getFormModelForServiceContacts():Observable<any>{
        if (t(this.serviceItem).isNullOrUndefined){
            return new Observable((observer) => {
                observer.error("Service-Item not set");
            });
        }
        //console.log(this.requiredContactTypes);
        let formModel : DynamicFormModel = [];
        let formObservable = new Observable((observer) => {
            let contactControl = new ServiceItemContactDFCControlModel({
                    id:"serviceitem_contactRelation",
                    itemId:this.serviceItem.id,
                    value:this.contactRelations,
                    validators:{
                        myCustomValidator: {
                        name: serviceContactsValidator.name,
                        args: this.requiredContactTypes
                    }},
                    requiredContactRoles:this.requiredContactTypes
                }
            );
            formModel.push(contactControl);

            observer.next(formModel);
            observer.complete();

        });
        return formObservable;
    }


    getFormModelForServiceObject():Observable<any>{
        if (t(this.serviceItem).isNullOrUndefined){
            return new Observable((observer) => {
                observer.error("Service-Item not set");
            });
        }
        let formModel : DynamicFormModel = [];
        if (this.serviceItem._type!=="ServiceDto"){
            return new Observable((observer) => {
                observer.next(formModel);
                observer.complete();

            });
        }

        let formObservable = new Observable((observer) => {

            //Laufzeiten
            let availableTerms = this.svcItemService.getAvailableServiceTermsForService(this.serviceItem).map(function (val){

              let dv = {"label":val.name,"value":val.value};
              return dv;

            });

            let serviceTerm = this.svcItemService.getServiceTerms(this.serviceItem);
              if (serviceTerm === null){
                  //Standard-Laufzeit
                  serviceTerm = this.svcItemService.getDefaultServiceTermForService(this.serviceItem);
                  if (serviceTerm===null){
                      serviceTerm = {name:"",value:null};
                  }
            }

            let model = new DynamicSelectModel<string>({
                    id: "serviceitem_serviceTerms",
                    label: "Laufzeit",
                    value:serviceTerm.value,
                    multiple: false,
                    options:availableTerms,
                    additional:{
                        type:"serviceItem",
                    }
            });
            let validators = { required: null};
            model.validators=validators;
            model.errorMessages= { required: "Laufzeit ist erforderlich." };


            if ((this.serviceItem.status !== "TEST") && (this.serviceItem.status !== "INWORK")){
                model.disabled=true;
            }
            formModel.push(model);
            //Laufzeiten Ende


            observer.next(formModel);
            observer.complete();

        });
        return formObservable;
    }

    getFormModelForMultiplicity (childrenMultiplicities:Array<ServiceItemMultiplicityDto>):Observable<any>{
        let formModel : DynamicFormModel = [];
        let formObservable = new Observable((observer) => {

            //formModel.push(model);
            //0..1 Kardinalitaeten, also an/aus
            let switchGroup = new DynamicFormGroupModel({
                id:"switchMultiplicity",
                group:[]
            });
            //this.logger.debug("multiplicity ",childrenMultiplicities);

            let switchMultiplicities = childrenMultiplicities.filter(m => m.cardinality.lowerLimit==0 && m.cardinality.upperLimit==1);
            for (let multiplicity of switchMultiplicities){
                //childAssociationDisplayName
                //multiplicity
                let value = false;
                if(multiplicity.multiplicity == 1){
                    value = true;
                }
                let model = new DynamicSwitchModel({
                        id: multiplicity.childAssociationName,
                        offLabel: multiplicity.childAssociationDisplayName,
                        onLabel: multiplicity.childAssociationDisplayName,
                        value: value,
                        additional:{
                            multiplicitySwitch:true,
                            multiplicity:multiplicity

                        }
                });
                switchGroup.group.push(model);
            }
            formModel.push(switchGroup);
            observer.next(formModel);
            observer.complete();
        });




        return formObservable;

    }



    getFormModel(serviceItem:ServiceItemDto):Observable<any>{
        this.serviceItem = serviceItem;
        this.requiredContactTypes=[];
        this.attributeValidationRules=null;
        this.itemAttributes=null;
        let formObservable = new Observable((observer) => {

            this.buildValidationRules();
            console.log(this.serviceItem);

            this.svcItemService.getItemAttributes(this.serviceItem.id).subscribe(res => {
                this.itemAttributes = res;

                this.formModel = [].concat(this.getServiceObjectFormModel());

                let f = new UserVisibleAttributeFilterPipe();
                for (let attribute of f.transform(this.itemAttributes)){
                  console.log(attribute);

                  //this.formModel.push(this.getFakeModel());
                  switch(attribute._type){
                      case "AttributeEnumDto":
                        //formSpec.formDefinition.components.push(this.getEnumAttributeComponent(attribute));
                        this.formModel.push(this.getEnumAttributeComponent(attribute,this.itemAttributes));
                      break;
                      case "AttributeStringDto":
                        this.formModel.push(this.getStringAttributeComponent(attribute,this.itemAttributes));
                      break;
                      default:
                        console.warn("Unknown attributetype " + attribute._type);
                  }

                }


                let test = new ServiceItemContactDFCControlModel({
                    id:"serviceitem_contactRelation",
                    itemId:this.serviceItem.id,
                    requiredContactRoles:this.requiredContactTypes
                }

                );
                //console.log(test);

                this.formModel.push(test);


                observer.next(this.formModel);
                //observer.complete();
                //observer.error("fehler");
                observer.complete();
            });



        });




        return formObservable;

    }

    /**
     * Gets Form-Model for Service-Object itself
     *
     *
     */
    public getServiceObjectFormModel(){
      let formModel : DynamicFormModel = [];
      if(this.serviceItem._type==="ServiceDto"){
          //Laufzeiten
          let availableTerms = this.svcItemService.getAvailableServiceTermsForService(this.serviceItem).map(function (val){

              let dv = {"label":val.name,"value":val.value};
              return dv;

            });

          let serviceTerm = this.svcItemService.getServiceTerms(this.serviceItem);
          if (serviceTerm === null){
              //Standard-Laufzeit
              serviceTerm = this.svcItemService.getDefaultServiceTermForService(this.serviceItem);
              if (serviceTerm===null){
                  serviceTerm = {name:"",value:null};
              }
          }

          let model = new DynamicSelectModel<string>({
                id: "serviceitem_serviceTerms",
                label: "Laufzeit",
                value:serviceTerm.value,
                multiple: false,
                options:availableTerms

            });
            let validators = { required: null};
            model.validators=validators;
            model.errorMessages= { required: "Laufzeit ist erforderlich." };


            if ((this.serviceItem.status !== "TEST") && (this.serviceItem.status !== "INWORK")){
                model.disabled=true;
            }
            console.log(model);
            formModel.push(model);
        }


        return formModel;

    }

    private getAttributeSaveData(value:any,attribute:any,valueHandler:ValueHandler,valuePropertyPath?:string){

        let updateEnum = null;

        switch (valueHandler){
            case ValueHandler.DEFAULT_STRING_HANDLER:
                if (this.isAttributeStoredAsJSON(attribute)){
                    attribute.value=JSON.stringify(value);
                } else {
                    attribute.value = value;
                }
                return <AttributeSaveData>{attribute:attribute,extendedConfig:null};
            break;
            case ValueHandler.DEFAULT_ENUM_HANDLER:
                updateEnum = this.getEnumAttributeValueByValue(attribute,value);
                if (!t(updateEnum).isNullOrUndefined){
                    attribute.values[0] = updateEnum;
                }
                return <AttributeSaveData>{attribute:attribute,extendedConfig:null};
            break;
            case ValueHandler.CONFIG_ENUM_HANDLER:
                //Get Attribute-Value from specified Property-Path
                let attrValue = t(value,valuePropertyPath).safeString;
                this.logger.debug("Got attrValue ",attrValue);
                updateEnum = this.getEnumAttributeValueByValue(attribute,attrValue);
                if (!t(updateEnum).isNullOrUndefined){
                    attribute.values[0] = updateEnum;
                }

                //attribute.values[0] = updateEnum;
                return <AttributeSaveData>{attribute:attribute,extendedConfig:value};
            break;

        }

    }

    /**
     * Returns Attriute-Value and extendedConfig(if present) of Attribute as AttributeSaveData-Object,
     * for updating the ServiceItem
     */
    private getAttributeSaveDataOld(attribute:any,formData:any){
        let saveData:AttributeSaveData=null;
        let rendererProperty:CustomPropertyDto=null;
        let updateEnum = null;
        switch(attribute._type){
            case "AttributeEnumDto":

                rendererProperty = this.getCustomPropertyByName(attribute,constants.ATTRIBUTE_RENDERER);
                if (rendererProperty===undefined){
                    updateEnum = this.getEnumAttributeValueByValue(attribute,formData);
                    attribute.values[0] = updateEnum;
                    return <AttributeSaveData>{attribute:attribute,extendedConfig:null};
                }
                //Renderer-Specific Value-Handling ?
                switch(rendererProperty.value){
                    case constants.ATTRIBUTE_RENDERER_BSAPRODUCT:
                        //Value
                        let
                        updateEnum = this.getEnumAttributeValueByValue(attribute,formData.produkt.produktoption);
                        attribute.values[0] = updateEnum;
                        //Extended-config
                        return <AttributeSaveData>{attribute:attribute,extendedConfig:formData};
                    default:
                        updateEnum = this.getEnumAttributeValueByValue(attribute,formData);
                        attribute.values[0] = updateEnum;
                        return <AttributeSaveData>{attribute:attribute,extendedConfig:null};
                }
              break;
              case "AttributeStringDto":
                rendererProperty = this.getCustomPropertyByName(attribute,constants.ATTRIBUTE_RENDERER);
                if (rendererProperty===undefined){
                    if (this.isAttributeStoredAsJSON(attribute)){
                         attribute.value=JSON.stringify(formData);
                    } else {
                        attribute.value = formData;
                    }
                    return <AttributeSaveData>{attribute:attribute,extendedConfig:null};
                }
                //Renderer-Specific Value-Handling ?
                switch(rendererProperty.value){
                    default:
                        if (this.isAttributeStoredAsJSON(attribute)){
                            attribute.value=JSON.stringify(formData);
                        } else {
                            attribute.value = formData;
                        }
                        return <AttributeSaveData>{attribute:attribute,extendedConfig:null};
                }
              break;
              default:
                this.logger.warn('Unknown Attribute-Type ',attribute._type);
                return null;

          }
    }

    /**
     * Get Attribute-Value
     */
    private getAttributeValue(attribute:any):any{
      let attributeValue=null;
      //let formKey = attribute.name;
      switch(attribute._type){
          case "AttributeEnumDto":
            attributeValue = attribute.values[0].value;
          break;
          case "AttributeStringDto":
              if (this.isAttributeStoredAsJSON(attribute)){
                 attributeValue = JSON.parse(attribute.value);
              } else {
                attributeValue = attribute.value;
              }
          break;
          default:
            this.logger.warn('Unknown Attribute-Type ',attribute._type);
      }

      return attributeValue;

    }


  private getEnumAttributeComponent(attribute:any,itemAttributes:Array<any>):any{
      let rendererProperty:CustomPropertyDto = this.getCustomPropertyByName(attribute,constants.ATTRIBUTE_RENDERER);

      if (rendererProperty===undefined){
          return this.getDefaultEnumAttributeComponent(attribute,itemAttributes);
      }
      //console.log(rendererProperty);
      switch(rendererProperty.value){
          case constants.ATTRIBUTE_RENDERER_BSAPRODUCT:
            return this.getBSAProductComponent(attribute,itemAttributes);
          default:
            return this.getDefaultEnumAttributeComponent(attribute,itemAttributes);
      }
    return;
  }

  private getEnumAttributeValueByValue(attribute:any,value:string){
    return attribute.attributeDef.attributeType.values.find(a => a.value === value);
  }

  private getDefaultEnumAttributeComponent(attribute:any,itemAttributes:Array<any>):any{
      return new SelectComponent(attribute,itemAttributes,this.serviceItem).getDynamicModel();
  }

  private getBSAProductComponent(attribute:any,itemAttributes:Array<any>):any{

      //value aus extended config holen
      let savedValue = null;
      let extendedConfig = this.svcItemService.getServiceItemExtendedConfig(this.serviceItem,"extendedConfiguration");
      if (t(extendedConfig,'attributeConfigs').isArray){
          let savedConfig = extendedConfig.attributeConfigs.find(c => c.attribute == attribute.name );
          if (!t(savedConfig,'config').isNullOrUndefined){
            savedValue=savedConfig.config;
            }
      }

      let controlDisabled=false;
      if ((this.serviceItem.status !== "TEST") && (this.serviceItem.status !== "INWORK")){

            controlDisabled=true;
      }

      /* BSA 250
, {
	"materialNummer": "89896963",
	"produktoption": "bsa2550",
	"produktoptionName": "250 MBit/s"
}
      */

      return new DynamicDslAbfrageControlModel({
        id: "attribute_"+attribute.name,
        disabled:controlDisabled,
        value:savedValue,
        additional:{
                type:"attribute",
                attribute:attribute,
                attributeValueHandler:ValueHandler.CONFIG_ENUM_HANDLER,
                valuePropertyPath:'produkt.produktoption'
        },
        validators: {
        required: null
        },
        selectableBSAProducts : [{
	"materialNummer": "89800055",
	"produktoption": "bsa100_40",
	"produktoptionName": "100/40 MBit/s"
}, {
	"materialNummer": "89743558",
	"produktoption": "bsa16_1",
	"produktoptionName": "16/1 MBit/s"
}, {
	"materialNummer": "89742311",
	"produktoption": "bsa25_5",
	"produktoptionName": "25/5 MBit/s"
}, {
	"materialNummer": "89742312",
	"produktoption": "bsa50_10",
	"produktoptionName": "50/10 MBit/s"
}
]

    }

    );

  }


  private getStringAttributeComponent(attribute:any,itemAttributes:Array<any>):any{

    let filterProperty:CustomPropertyDto = this.getCustomPropertyByName(attribute,constants.ATTRIBUTE_RENDERER);
    let renderer = this.getCustomPropertyValueByName(attribute,constants.ATTRIBUTE_RENDERER);

    if (renderer===null){
          return this.getDefaultStringAttributeComponent(attribute,itemAttributes);
      }
    //let comp = new TextComponent(attribute,itemAttributes,this.serviceItem).getComponent();
    //let model = new TextComponent(attribute,itemAttributes,this.serviceItem).getDynamicModel();
    //ATTRIBUTE_RENDERER_TEXTAREA

    switch(renderer){
          case constants.ATTRIBUTE_RENDERER_CONTACT:
            //return this.getContactStringAttributeComponent(attribute);
            return new MockAutoCompleteComponent(attribute,itemAttributes,this.serviceItem).getDynamicContactModel(this.searchService); ;
          case constants.ATTRIBUTE_RENDERER_COMPANY:
            //return this.getCompanyStringAttributeComponent(attribute);
          case constants.ATTRIBUTE_RENDERER_TEXTAREA:
            return this.getTextAreaAttributeComponent(attribute,itemAttributes);
          default:
            return this.getDefaultStringAttributeComponent(attribute,itemAttributes);
    }

    //return model;
  }

  private getDefaultStringAttributeComponent(attribute,itemAttributes:Array<any>):DynamicInputControlModel<any>{

      return new TextComponent(attribute,itemAttributes,this.serviceItem).AttributeRules(this.attributeValidationRules).getDynamicModel(); ;


  }

  private getTextAreaAttributeComponent(attribute,itemAttributes:Array<any>):DynamicInputControlModel<any>{

      return new TextAreaComponent(attribute,itemAttributes,this.serviceItem).AttributeRules(this.attributeValidationRules).getDynamicModel(); ;


  }

  public buildValidationRules(){
        this.requiredContactTypes=[];
        this.attributeValidationRules = [];

        let configProp = this.getProductItemCustomPropertyByName(this.serviceItem.productItem,"extendedConfiguration");
        if (configProp===undefined){
            return;
        }
        if (t(this.serviceTransition).isNullOrUndefined){
            return;
        }
        let config = JSON.parse(configProp.value);

        if (!t(config,"transitionValidation").isArray){
            return;
        }
        const validations = config.transitionValidation;
        const activeValidationRules = [];

        //console.log(validations);
        //let test = validations as Array<any>;

        //console.log(Array.from(validations);
        let validation = this.getValidationRuleForTransition(validations, this.serviceTransition.transition);
        if (t(validation).isNullOrUndefined){
            console.log("no validation rule found for transition " + this.serviceTransition.transition)
            return;
        }
        activeValidationRules.push(validation);
        if (validation.cumulative === true){
           if(!t(this.serviceTransition.predecessors).isEmptyArray) {

            for (let p of this.serviceTransition.predecessors){
                let pRule = this.getValidationRuleForTransition(validations, p);
                if (pRule !== undefined){
                    activeValidationRules.push(pRule);
                }
            }
           }
        }


        const uniqueRequiredContacts = [];
        activeValidationRules.map(t=>t.requiredContactTypes).reduce(function(result,nextItem){return result.concat(nextItem);},[]).map(x => uniqueRequiredContacts.filter(a => a.id == x.id).length > 0 ? null : uniqueRequiredContacts.push(x));
        this.requiredContactTypes=uniqueRequiredContacts.map(c => c.name);

        const uniqueAttributeRules = [];
        activeValidationRules.map(t=>t.attributeRules).reduce(function(result,nextItem){return result.concat(nextItem);},[]).map(x => uniqueAttributeRules.filter(a => a.attributeName == x.attributeName && a.validationType == x.validationType).length > 0 ? null : uniqueAttributeRules.push(x));

        this.attributeValidationRules = uniqueAttributeRules;


  }

  private getValidationRuleForTransition(transitionValidation,transition:string):any{
        let validation = transitionValidation.find(v => v.name === transition);
        if (t(validation).isNullOrUndefined){
            return undefined;
        }

        return validation;
  }

  public setServiceItem(serviceItem:ServiceItemDto):void{
      this.serviceItem = serviceItem;
      this.buildValidationRules();

  }

  public setServiceItemContactRelations(contactRel:Array<ContactRelationDto>){
      this.contactRelations = contactRel;
  }

  public setServiceItemAttributes(itemAttributes:AttributeDto[]):void{
      this.itemAttributes = itemAttributes;

  }

  public setServiceTransition(transition:string):void{
     if (!t(SmdbConfig.transitions).isArray){
        console.warn("No Transition Mapping found")
        return undefined;
     }
     let transitionObj = SmdbConfig.transitions.find(i => i.transition === transition);
     if (t(transitionObj).isNullOrUndefined){
        console.warn("No Transition Mapping for " + transition + " found");
        return undefined;
     }
     this.serviceTransition = transitionObj;
     //console.log(this.serviceTransition);
  }
  /*
  private getTransition(newState:string):string{

      //Transitions aus Mapping laden
      if (t(SmdbConfig.transitions).isArray){
        return undefined;
      }
      let transition = SmdbConfig.transitions.find(i => {
          if ((i.fromState === this.serviceItem.status) && (i.toState === newState)){
              return true;
          }
        return false;
      });
      console.log(transition);

  }*/

  private getProductItemCustomPropertyByName(product:any,propertyName:string):any{
      let customProperties:any = product.customProperties;
      let prop = customProperties.properties.find(i => i.name === propertyName);
      if (t(prop).isNullOrUndefined){
          return undefined;
      }
      return prop;
      //return customProperties.properties.find(i => i.name === propertyName);
  }

  private getCustomPropertyByName(attribute:AttributeDto,propertyName:string):CustomPropertyDto{
      let customProperties:any = attribute.attributeDef.attributeDef.customProperties;
      //return customProperties.properties.find(i => i.name === propertyName);
      let prop = customProperties.properties.find(i => i.name === propertyName);
      if (t(prop).isNullOrUndefined){
          return undefined;
      }
      return prop;
  }

  private getCustomPropertyValueByName(attribute:AttributeDto,propertyName:string):string{
      let customProperties:CustomPropertiesDto = attribute.attributeDef.attributeDef.customProperties;
      let property = customProperties.properties.find(i => i.name === propertyName);
      if (property === undefined) return undefined;
      return property.value;
  }


  private isAttributeStoredAsJSON(attribute:any):boolean{
      let filterProperty:CustomPropertyDto = this.getCustomPropertyByName(attribute,'attributeStoredAsJson');
      if (t(filterProperty,'value').isTrue){
          return true;
      }
      return false;
  }

  private isAttributeUpdateable(attribute:any):boolean{

    //FUNCTIONAL attributes only
    if(attribute.attributeDef.attributeDef.functionalType === "FUNCTIONAL"){
        if ((this.serviceItem.status !== "TEST") && (this.serviceItem.status !== "INWORK")){
            return false;
        }
    }

    if (t(attribute,"attributeDef.attributeDef.readonly").isTrue){
          return false;

    }
    return true;
  }

  private getUpdatedDataFromModel(formModel: any){

      let modifiedExtendedAttributeConfigs:Array<any>=[];
      let modifiedAttributes:Array<AttributeDto>=[];

      //filter model for attributes
      let attributeModels = formModel.filter(m => {
          if (m instanceof DynamicFormValueControlModel){
              if (m.getAdditional('type') === "attribute"){
                  return true;

              }
          }
      });
      //console.log(attributeModels);
      for (let model of attributeModels){
          if (!t(model,'additional.attribute').isNullOrUndefined){
            if (this.isAttributeUpdateable(model.additional.attribute)){
                let propertyPath = t(model,'additional.valuePropertyPath').safeString;
                let saveData = this.getAttributeSaveData(model.value,model.additional.attribute,model.additional.attributeValueHandler,propertyPath);
                modifiedExtendedAttributeConfigs.push({attribute:model.additional.attribute.name,config:saveData.extendedConfig});
                modifiedAttributes.push(saveData.attribute);

            }
          }
      }

      return {attributes:modifiedAttributes,extendedAttributeConfigs:modifiedExtendedAttributeConfigs};

  }



  getUpdatedAttributesFromModel(formModel: any):Array<AttributeDto>{
      let updatedData = this.getUpdatedDataFromModel(formModel);
      return updatedData.attributes;

  }

  getUpdatedServiceItemFromModel(formModel: any):ServiceItemDto{

      let extendedAttributeConfigs:any=null;
      let modifiedExtendedAttributeConfigs:Array<any>=[];
      //let modifiedAttributes:Array<AttributeDto>=[];

      let extendedConfig = this.svcItemService.getServiceItemExtendedConfig(this.serviceItem,"extendedConfiguration");
      if (t(extendedConfig,'attributeConfigs').isArray){
        extendedAttributeConfigs = extendedConfig.attributeConfigs;
      } else {
        extendedAttributeConfigs = [];
      }

      let updatedData = this.getUpdatedDataFromModel(formModel);
      modifiedExtendedAttributeConfigs=updatedData.extendedAttributeConfigs;

      //Remove existing extendedconfig for attributes that have updated extendedconfig
      for (let mac of modifiedExtendedAttributeConfigs){
          extendedAttributeConfigs.splice(extendedAttributeConfigs.findIndex(item => item.attribute===mac.attribute));

      }
      for (let mac of modifiedExtendedAttributeConfigs){
          extendedAttributeConfigs.push(mac);
      }

      if (this.serviceItem._type==="ServiceDto"){
          //Todo: checken ob custom-property existiert
        if (!t(this.serviceItem.customProperties.properties.find(p=>p.name==="serviceTerms")).isNullorUndefined){
            let model = formModel.find(m => m.id==="serviceitem_serviceTerms");
            if (!t(model).isNulOrUndefined){
                this.serviceItem.customProperties.properties.find(p=>p.name==="serviceTerms").value=model.value;
            }
        }
        if (!t(this.serviceItem.customProperties.properties.find(p=>p.name==="extendedConfiguration")).isNullorUndefined){
            this.serviceItem.customProperties.properties.find(p=>p.name==="extendedConfiguration").value=JSON.stringify({	"attributeConfigs":extendedAttributeConfigs});
        }

      }

      return this.serviceItem;


  }


  /**
   * Updates ServiceItemDTO Attributes & basedata with form data.

   */
  updateServiceItemDTOWithFormData(formData){
      //this.logger.debug(formData);
      let extendedAttributeConfigs:any=null;
      let modifiedExtendedAttributeConfigs:Array<any>=[];
      let modifiedAttributes:Array<AttributeDto>=[];

      let extendedConfig = this.svcItemService.getServiceItemExtendedConfig(this.serviceItem,"extendedConfiguration");
      if (t(extendedConfig,'attributeConfigs').isArray){
        extendedAttributeConfigs = extendedConfig.attributeConfigs;
      } else {
        extendedAttributeConfigs = [];
      }


      const PFX_ATTR="attribute_";
      //Nur Form-Elemente die mit PXF_ATTR starten
      const attributeFormData = Object.keys(formData)
        .filter(key => key.substr(0,PFX_ATTR.length)===PFX_ATTR)
        .map(attrName => attrName.substr(PFX_ATTR.length));
      //Nur Attribute aktualisieren, die im formular vorhanden sind
      const attributestoUpdate = this.itemAttributes.filter(attr => attributeFormData.includes(attr.name));

      for (let attribute of new UserVisibleAttributeFilterPipe().transform(this.itemAttributes)){
          if (this.isAttributeUpdateable(attribute)){
              let saveData = this.getAttributeSaveDataOld(attribute,formData[PFX_ATTR+attribute.name]);
              modifiedExtendedAttributeConfigs.push({attribute:attribute.name,config:saveData.extendedConfig});
              modifiedAttributes.push(saveData.attribute);
              //console.log(saveData);
          }
      }

      //Remove existing extendedconfig for attributes that have updated extendedconfig
      for (let mac of modifiedExtendedAttributeConfigs){
          extendedAttributeConfigs.splice(extendedAttributeConfigs.findIndex(item => item.attribute===mac.attribute));

      }
      for (let mac of modifiedExtendedAttributeConfigs){
          extendedAttributeConfigs.push(mac);
      }

      console.log(extendedAttributeConfigs);
      if (this.serviceItem._type==="ServiceDto"){
          //Todo: checken ob custom-property existiert
        if (!t(this.serviceItem.customProperties.properties.find(p=>p.name==="serviceTerms")).isNullorUndefined){
            this.serviceItem.customProperties.properties.find(p=>p.name==="serviceTerms").value=formData.serviceitem_serviceTerms;
        }
        if (!t(this.serviceItem.customProperties.properties.find(p=>p.name==="extendedConfiguration")).isNullorUndefined){
            this.serviceItem.customProperties.properties.find(p=>p.name==="extendedConfiguration").value=JSON.stringify({	"attributeConfigs":extendedAttributeConfigs});
        }
        console.log(this.serviceItem.customProperties);
      }

      return <ServiceItemSaveData> {serviceItem:this.serviceItem,itemAttributes:modifiedAttributes};


  }


}
