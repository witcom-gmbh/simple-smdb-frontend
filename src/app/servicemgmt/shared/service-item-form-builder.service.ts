import { Injectable } from '@angular/core';
import { Observable,throwError  } from 'rxjs';
import t from 'typy';
import { NGXLogger } from 'ngx-logger';
import { ServiceItemDto,AttributeDto,
  AttributeDefDto,
  CustomPropertiesDto,CustomPropertyDto,ContactRelationDto,ServiceItemMultiplicityDto,AttributeDefAssociationDto } from '../../api/models';
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
import {AbstractBaseComponent,TextComponent,TextAreaComponent,MockAutoCompleteComponent,SelectComponent,NumberComponent} from './form-component-builder/form-components';
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
    private productItemAttributes:Array<AttributeDefAssociationDto>=[];
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
                  //console.log(attribute);
                  switch(attribute._type){
                      case "AttributeEnumDto":
                        //formSpec.formDefinition.components.push(this.getEnumAttributeComponent(attribute));
                        formModel.push(this.getEnumAttributeComponent(attribute,this.itemAttributes));
                      break;
                      case "AttributeStringDto":
                        formModel.push(this.getStringAttributeComponent(attribute,this.itemAttributes));
                      break;
                      case "AttributeDecimalDto":
                        formModel.push(this.getDecimalAttributeComponent(attribute,this.itemAttributes));
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

            if (this.svcItemService.isServicePricingTermBased(this.serviceItem)){


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
            }

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


    /**
     * Get save-data from form-data. Special handling required for cases like
     * storing Value as JSON, or storing additional configuration
     *
     * @param value - the form-value that has to be saved
     * @param attribute - SMDB-Attribute
     * @param valueHandler - defines how to handle the value
     * @param valuePropertyPath - defines the JSON-Path where the SMDN-Attribute value is found within the form-data-value
     */
    private getAttributeSaveData(value:any,attribute:any,valueHandler:ValueHandler,valuePropertyPath?:string):AttributeSaveData{

        let updateEnum = null;

        switch (valueHandler){
            case ValueHandler.DEFAULT_STRING_HANDLER:
                if (this.isAttributeStoredAsJSON(attribute)){
                    attribute.value=JSON.stringify(value);
                } else {
                    attribute.value = value;
                }
                return <AttributeSaveData>{attribute:attribute,extendedConfig:null};

            case ValueHandler.DEFAULT_NUMBER_HANDLER:
                attribute.value = value;
                return <AttributeSaveData>{attribute:attribute,extendedConfig:null};
            case ValueHandler.DEFAULT_ENUM_HANDLER:
                updateEnum = this.getEnumAttributeValueByValue(attribute,value);
                if (!t(updateEnum).isNullOrUndefined){
                    attribute.values[0] = updateEnum;
                }
                return <AttributeSaveData>{attribute:attribute,extendedConfig:null};
            case ValueHandler.CONFIG_ENUM_HANDLER:
                //Get Attribute-Value from specified Property-Path
                let attrValue = t(value,valuePropertyPath).safeString;
                //this.logger.debug("Got attrValue ",attrValue);
                updateEnum = this.getEnumAttributeValueByValue(attribute,attrValue);
                if (!t(updateEnum).isNullOrUndefined){
                    attribute.values[0] = updateEnum;
                }

                //attribute.values[0] = updateEnum;
                return <AttributeSaveData>{attribute:attribute,extendedConfig:value};

        }

    }


  private getEnumAttributeComponent(attribute:any,itemAttributes:Array<any>):any{
      //get attribute from product - attributes on service-items are inconsistent
      let productAttribute:AttributeDefAssociationDto = this.productItemAttributes.find(p => p.id === attribute.attributeDef.id);
      if (t(productAttribute).isNullOrUndefined){
        return this.getDefaultEnumAttributeComponent(attribute,itemAttributes);
      }
      let rendererProperty:CustomPropertyDto = this.getCustomPropertyByName(productAttribute.attributeDef,constants.ATTRIBUTE_RENDERER);

      if (rendererProperty===undefined){
          return this.getDefaultEnumAttributeComponent(attribute,itemAttributes);
      }
      //console.log(rendererProperty);
      switch(rendererProperty.value){
          case constants.ATTRIBUTE_RENDERER_BSAPRODUCT:
            return this.getBSAProductComponent(attribute,itemAttributes);
          case constants.ATTRIBUTE_RENDERER_READONLY:
            return this.getReadOnlyEnumAttributeComponent(attribute,itemAttributes);
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

  private getReadOnlyEnumAttributeComponent(attribute:any,itemAttributes:Array<any>):any{
    let component:SelectComponent = new SelectComponent(attribute,itemAttributes,this.serviceItem);
    return component.Disabled().getDynamicModel();
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

      //If there is no extended configuration it means no DSL-Check has been performed.
      let defaultOption:String = "Kein Standardwert";
      if (savedValue==null){
        if (t(attribute, 'values[0].displayValue.defaultText').isDefined){
          defaultOption = attribute.values[0].displayValue.defaultText;
        }
      }
      let attributeOptions:Array<any> = attribute.attributeDef.attributeType.values
      let products:Array<DSLAbfrageProdukt> = attributeOptions.map(function (option){

              let p:DSLAbfrageProdukt = <DSLAbfrageProdukt>{};
              //ToDo get localized Value withfilter
              p.produktoptionName = option.displayValue.defaultText;
              p.produktoption = option.value;

              //parse json from description
              p.materialNummer = null;
              //Get special config ;-)
              if(!t(option.description.defaultText).isNullOrUndefined){
                let optionConfig:any = JSON.parse(option.description.defaultText);
                if (t(optionConfig.materialNummer).isDefined ){
                  p.materialNummer = optionConfig.materialNummer;
                }
              }
              return p;
            })
            .filter(p => p.materialNummer!=null);

      console.log(products);
      //Build selectable BSA-Products


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
        selectableBSAProducts : products,
        defaultOption: defaultOption
    }

    );

  }

  private getDecimalAttributeComponent(attribute:any,itemAttributes:Array<any>):any{

      let productAttribute:AttributeDefAssociationDto = this.productItemAttributes.find(p => p.id === attribute.attributeDef.id);
      if (t(productAttribute).isNullOrUndefined){
        return this.getDefaultDecimalAttributeComponent(attribute,itemAttributes);
      }
      let rendererProperty:CustomPropertyDto = this.getCustomPropertyByName(productAttribute.attributeDef,constants.ATTRIBUTE_RENDERER);

      if (rendererProperty===undefined){
          return this.getDefaultDecimalAttributeComponent(attribute,itemAttributes);
      }

      switch(rendererProperty.value){

          default:
            return this.getDefaultDecimalAttributeComponent(attribute,itemAttributes);
      }

  }

  private getDefaultDecimalAttributeComponent(attribute,itemAttributes:Array<any>):DynamicInputControlModel<any>{

      return new NumberComponent(attribute,itemAttributes,this.serviceItem).AttributeRules(this.attributeValidationRules).getDynamicModel(); ;


  }

  private getStringAttributeComponent(attribute:any,itemAttributes:Array<any>):any{

    let productAttribute:AttributeDefAssociationDto = this.productItemAttributes.find(p => p.id === attribute.attributeDef.id);
    if (t(productAttribute).isNullOrUndefined){
      return this.getDefaultStringAttributeComponent(attribute,itemAttributes);
    }
    let rendererProperty:CustomPropertyDto = this.getCustomPropertyByName(productAttribute.attributeDef,constants.ATTRIBUTE_RENDERER);

    if (rendererProperty===undefined){
        return this.getDefaultStringAttributeComponent(attribute,itemAttributes);
    }

    switch(rendererProperty.value){
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

  public setProductitemAttributes(productItemAttributes:AttributeDefAssociationDto[]):void{
    this.productItemAttributes = productItemAttributes;


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

  /**
   * Get custom -property from attribute-definition
   *
   * @param attributeDef
   * @param propertyName
   */
  private getCustomPropertyByName(attributeDef:AttributeDefDto,propertyName:string):CustomPropertyDto{
    let customProperties:any = attributeDef.customProperties;
    let prop = customProperties.properties.find(i => i.name === propertyName);
    if (t(prop).isNullOrUndefined){
        return undefined;
    }
    return prop;
  }


  /**
   * DEPRECATED
   *
   * @param attribute
   * @param propertyName
   */
  private getCustomPropertyValueByName(attribute:AttributeDto,propertyName:string):string{
      let customProperties:CustomPropertiesDto = attribute.attributeDef.attributeDef.customProperties;
      let property = customProperties.properties.find(i => i.name === propertyName);
      if (property === undefined) return undefined;
      return property.value;
  }


  private isAttributeStoredAsJSON(attribute:any):boolean{
      let filterProperty:CustomPropertyDto = this.getCustomPropertyByName(attribute.attributeDef.attributeDef,'attributeStoredAsJson');
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

      //Remove existing extendedconfig from array for attributes that have been updated
      for (let mac of modifiedExtendedAttributeConfigs){
          extendedAttributeConfigs.splice(extendedAttributeConfigs.findIndex(item => item.attribute===mac.attribute));

      }
      //Add updated config
      for (let mac of modifiedExtendedAttributeConfigs){
          extendedAttributeConfigs.push(mac);
      }

      if (this.serviceItem._type==="ServiceDto"){
          //Laufzeit speichern
          if (this.svcItemService.isServicePricingTermBased(this.serviceItem)){
            let model = formModel.find(m => m.id==="serviceitem_serviceTerms");
            if (!t(model).isNullOrUndefined){
                this.serviceItem.customProperties.properties.find(p=>p.name==="serviceTerms").value=model.value;
            }
          } else {
            this.serviceItem.customProperties.properties.find(p=>p.name==="serviceTerms").value="";
          }
          //Erweiterte Konfiguration speichern
          if (!t(this.serviceItem.customProperties.properties.find(p=>p.name==="extendedConfiguration")).isNullorUndefined){
            this.serviceItem.customProperties.properties.find(p=>p.name==="extendedConfiguration").value=JSON.stringify({	"attributeConfigs":extendedAttributeConfigs});
          }

      }

      return this.serviceItem;


  }




}
