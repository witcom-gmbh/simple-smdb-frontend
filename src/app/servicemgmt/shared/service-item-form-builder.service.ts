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
import {AttributeProcessorService} from '../../services/services';
import {AttributeProcessor} from '../../shared/attribute-processor-config';
import { ResourceLoader } from '@angular/compiler';

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
        private svcItemService:ServiceItemService,
        private attrProcessor:AttributeProcessorService
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
                //this.buildValidationRules();
                //this.buildContactValidationRules();
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

            //ToDo - deprecate that
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
                attribute.value = value;
                return <AttributeSaveData>{attribute:attribute,extendedConfig:null};
            case ValueHandler.JSON_STRING_HANDLER:
                attribute.value=JSON.stringify(value);
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

    let processor:AttributeProcessor= this.getAttributeProcessor(attribute);
    switch(processor.renderer){
      case "BSAPRODUCT":
        return this.getBSAProductComponent(attribute,processor);
/*
Hande Readonly different - attribute is marked as readonly, renderer has to sho wit as readonly
        case "READONLY":
        return this.getReadOnlyEnumAttributeComponent(attribute,processor);
*/
      default:
        return this.getDefaultEnumAttributeComponent(attribute,processor);
    }
  }

  private getEnumAttributeValueByValue(attribute:any,value:string){
    return attribute.attributeDef.attributeType.values.find(a => a.value === value);
  }

  private getDefaultEnumAttributeComponent(attribute:any,processor:AttributeProcessor):any{
      return new SelectComponent(attribute,processor,this.serviceItem).getDynamicModel();
  }

  private getReadOnlyEnumAttributeComponent(attribute:any,processor:AttributeProcessor):any{
    let component:SelectComponent = new SelectComponent(attribute,processor,this.serviceItem);
    return component.Disabled().getDynamicModel();
  }

  //Todo - make a component
  private getBSAProductComponent(attribute:any,processor:AttributeProcessor):any{

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

      //console.log(products);
      //Build selectable BSA-Products

      //ToDo Return readdonly component id attribute is readonly

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

    let processor:AttributeProcessor= this.getAttributeProcessor(attribute);

    switch (processor.renderer){
      default:
        return this.getDefaultDecimalAttributeComponent(attribute,processor);

    }
  }

  private getDefaultDecimalAttributeComponent(attribute,processor:AttributeProcessor):DynamicInputControlModel<any>{
    let rules = this.getAttributeValidationRules(attribute);
    return new NumberComponent(attribute,processor,this.serviceItem).AttributeRules(rules).getDynamicModel(); ;

  }

  private getStringAttributeComponent(attribute:any,itemAttributes:Array<any>):any{
    let processor:AttributeProcessor= this.getAttributeProcessor(attribute);
    //this.getAttributeValidationRules(attribute);
    switch (processor.renderer){
      case "TEXTAREA":
        return this.getTextAreaAttributeComponent(attribute,processor);
      //person
      //return new MockAutoCompleteComponent(attribute,itemAttributes,this.serviceItem).getDynamicContactModel(this.searchService);
      //erschliessungs-systeme
      case "LOCATION":
        console.log("Location Renderer!!",JSON.parse(attribute.value));
        return this.getDefaultStringAttributeComponent(attribute,processor);

      default:
        return this.getDefaultStringAttributeComponent(attribute,processor);

    }

  }

  private getDefaultStringAttributeComponent(attribute,processor:AttributeProcessor):DynamicInputControlModel<any>{
      let rules = this.getAttributeValidationRules(attribute);
      return new TextComponent(attribute,processor,this.serviceItem).AttributeRules(rules).getDynamicModel(); ;
  }

  private getTextAreaAttributeComponent(attribute,processor:AttributeProcessor):DynamicInputControlModel<any>{
      let rules = this.getAttributeValidationRules(attribute);
      return new TextAreaComponent(attribute,processor,this.serviceItem).AttributeRules(rules).getDynamicModel(); ;
  }

  /**
   * Creates the list of required contacttypes for the current service-transition
   */
  public buildRequiredContactTypes(){

    this.requiredContactTypes=[];

    if (!t(SmdbConfig.contactsRequiredForTransitionMapping).isArray){
        this.logger.warn("No Contact-Transition Mapping found");
        return;
    }

    const activeReqContacts = [];
    //Get required contact for this service-transition
    let reqContacts=this.getRequiredContactsForTransition(this.serviceTransition.transition);
    //add reqcontacts to collection
    activeReqContacts.push(reqContacts);

    //get all predecessors for current service-transition
    let predecessors=this.serviceTransition.predecessors;
    //predecessors=["toOffered", "toCleanOrder"];
    if(!t(predecessors).isEmptyArray) {
      //loop through service-transitions
      for (let p of predecessors){
          //get required contact for this service-transition
          let pRule = this.getRequiredContactsForTransition(p);
          if (pRule !== undefined){
              activeReqContacts.push(pRule);
          }
      }
    }

    const uniqueRequiredContacts = [];
    //remove duplicates
    activeReqContacts.reduce(function(result,nextItem){return result.concat(nextItem);},[]).map(x => uniqueRequiredContacts.filter(a => a == x).length > 0 ? null : uniqueRequiredContacts.push(x));

    this.requiredContactTypes=uniqueRequiredContacts;

  }

  /**
   * Get RequiredcontactTypes for transition
   *
   * @param transition name of service-transition
   */
  getRequiredContactsForTransition(transition:String):Array<String>{
    //Lookup productproperty that stores the required-contact-types
    let mapping = SmdbConfig.contactsRequiredForTransitionMapping.find(i => i.transition === transition);

    if (t(mapping,"productProperty").isNullOrUndefined){
      this.logger.warn("RequiredContactTypes: Mapping for productproperty not found fpr transition " + transition);
      return [];
    }
    let productPropertyName = mapping.productProperty;

    //get custom-property
    let reqContactsProp = this.getProductItemCustomPropertyByName(this.serviceItem.productItem,productPropertyName);
    if (t(reqContactsProp,"multiValue.values").isNullOrUndefined){
      return [];
    }
    //The property is a taxonomy, so the prefix has to be removed
    return reqContactsProp.multiValue.values.map(x => x.substr(constants.TAXONOMY_PREFIX_CONTACT_ROLES.length))

  }


  /**
   * Get valaidation-rules for service-transition
   *
   * @param attribute
   */

  getAttributeValidationRules(attribute:AttributeDto):Array<any>{

    let transition = this.serviceTransition.transition;
    //transition="toReadyForManufacturing";
    let activeReqAttrs = [];
    //get rules for current transition
    let attrRequired = this.getAttributeValidationRuleForTransition(attribute,transition);
    if (attrRequired !== null){
      activeReqAttrs.push(attrRequired);
    }

    //get rules for previous transitions
    let predecessors=this.serviceTransition.predecessors;
    //predecessors=["toOffered", "toCleanOrder"];
    if(!t(predecessors).isEmptyArray) {
      for (let p of predecessors){
          let pRule = this.getAttributeValidationRuleForTransition(attribute,p);
          if (pRule !== null){
              activeReqAttrs.push(pRule);
          }
      }
    }

    //remove duplicates
    const uniqueAttributeRules = [];
    activeReqAttrs.map(t=>t).reduce(function(result,nextItem){return result.concat(nextItem);},[]).map(x => uniqueAttributeRules.filter(a => a.validationType == x.validationType).length > 0 ? null : uniqueAttributeRules.push(x));
    //this.logger.debug(uniqueAttributeRules);

    return uniqueAttributeRules;


  }

  /**
   * Get attribute validation rules for a single transition
   *
   * @param attribute
   * @param transition
   */
  getAttributeValidationRuleForTransition(attribute:AttributeDto,transition:String):any{

    //safety - check if attribute exists in my list of productItemAttributes
    let productAttribute:AttributeDefAssociationDto = this.productItemAttributes.find(p => p.id === attribute.attributeDef.id);
    if (t(productAttribute).isNullOrUndefined){
      this.logger.error("Unable to find productAttribute for attribute-definition " + attribute.attributeDef.id);
      throw new Error("Error when trying to get productattribute");
    }

    //get property that stores the definition
    let requiredProperty:CustomPropertyDto = this.getCustomPropertyByName(productAttribute.attributeDef,constants.ATTRIBUTE_PROPERTY_REQUIRED_FOR_TRANSITION);
    if (t(requiredProperty,'value').isNullOrUndefined){
      this.logger.warn("Unable to get attribute value for ",constants.ATTRIBUTE_PROPERTY_REQUIRED_FOR_TRANSITION);
      return null;
    }

    //map property-value to a transition
    let mapping = SmdbConfig.attributesRequiredForTransitionMapping.find(i => i.transition === transition);
    if (t(mapping,"attributeValue").isNullOrUndefined){
      //no mapping found
      //throw error?
      this.logger.error("Unable to find mapping between property "+requiredProperty+" and transition " + transition);
      return null;
    }
    //this.logger.debug("Attribute-Required-Mapping",mapping);
    //if the value that is mapped to transition matches the value of the property we are good

    if (mapping.attributeValue == requiredProperty.value){
      //we only support "required" validation
      //attribute-name is added for historical reasons
      let rule = {attributeName:attribute.name,validationType:"required"};
      return rule;
    }

    return null;
  }




  public setServiceItem(serviceItem:ServiceItemDto):void{
      this.serviceItem = serviceItem;
      this.buildRequiredContactTypes();
      //this.bui
      //this.buildContactValidationRules();

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
   * Get Attribute processor = how the attribute is rendered, stored, etc.
   * @param attribute
   */

  private getAttributeProcessor(attribute:AttributeDto):AttributeProcessor{
    let productAttribute:AttributeDefAssociationDto = this.productItemAttributes.find(p => p.id === attribute.attributeDef.id);
    if (t(productAttribute).isNullOrUndefined){
      this.logger.error("Unable to find productAttribute for attribute-definition " + attribute.attributeDef.id);
      throw new Error("Error when trying to get productattribute");
      //return this.getDefaultStringAttributeComponent(attribute,itemAttributes);
    }

    let processorProperty:CustomPropertyDto = this.getCustomPropertyByName(productAttribute.attributeDef,this.attrProcessor.getProcessorProperty());
    //no processor selected - take default
    if (t(processorProperty,'value').isNullOrUndefined){
      //processorId=processorProperty.value;
      return this.attrProcessor.getDefaultProcessor(attribute);
    }


    let processor:AttributeProcessor=this.attrProcessor.getAttributeProcessor(processorProperty);
    return processor;

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


  /**
   * Checks if attribute value has to be stored as json-encoded string
   *
   * @param attribute
   */
  private isAttributeStoredAsJSON(attribute:any):boolean{

    let processor:AttributeProcessor = this.getAttributeProcessor(attribute);
    if (processor.storeFormat=="JSON"){
      return true;
    }
    return false;

    /*

      let filterProperty:CustomPropertyDto = this.getCustomPropertyByName(attribute.attributeDef.attributeDef,'attributeStoredAsJson');
      if (t(filterProperty,'value').isTrue){
          return true;
      }
      return false;
      */
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
          //Erweiterte Konfiguration speichern
          if (!t(this.serviceItem.customProperties.properties.find(p=>p.name==="extendedConfiguration")).isNullOrUndefined){
            this.serviceItem.customProperties.properties.find(p=>p.name==="extendedConfiguration").value=JSON.stringify({	"attributeConfigs":extendedAttributeConfigs});
          }

      }

      return this.serviceItem;


  }


}
