import { Injectable } from '@angular/core';
import { Observable,throwError  } from 'rxjs';
import { ServiceItemDto,AttributeDto,CustomPropertiesDto,CustomPropertyDto } from '../api/models';
import { Select,DataValueDto,TextField,ValidateDto,BaseComponent,Button } from 'formio-schema';
import {UserVisibleAttributeFilterPipe,SplTranslatePipe} from '../shared/shared.module';
import {ServiceAttribute} from '../servicemgmt/svcitem-config/service-attribute';
import  * as constant from '../shared/constants.module';

/**
 * OBSOLET
 *
 */
@Injectable({
  providedIn: 'root'
})
export class FormBuilderService {


    private formDefinition:any={};
    private itemAttributes:Array<any>;
    private svcItemConfig:any;

  constructor() { }

  testObservable(): Observable<any>{

    let simpleObservable = new Observable((observer) => {

    // observable execution
    //observer.next({submission:{'data':{}},formDefinition:{title:'Attribute Form',components:[]}});
    //observer.complete();
    observer.error("fehler");
    observer.complete();
    })


    //  let formSpec:any = {submission:{'data':{}},formDefinition:{title:'Attribute Form',components:[]}};
    return simpleObservable;
  }

  buildModifiedAttributesFromFormData(itemAttributes:Array<any>,submissionData:any){
      let modifiedAttributes:Array<AttributeDto> = []
      let f = new UserVisibleAttributeFilterPipe();
      //console.log(submissionData);
      for (let attribute of f.transform(itemAttributes)){
          switch(attribute._type){
              case "AttributeEnumDto":
              if (submissionData.hasOwnProperty(attribute.name)){
                //Update the value with correct ENUM-Value
                let updateEnum = this.getEnumAttributeValueByValue(attribute,submissionData[attribute.name]);
                attribute.values[0] = updateEnum;
                modifiedAttributes.push(attribute);
              }

              break;
              case "AttributeStringDto":
                //Just update the value
                if (submissionData.hasOwnProperty(attribute.name)){
                    if (this.isAttributeStoredAsJSON(attribute)){
                         attribute.value=JSON.stringify(submissionData[attribute.name]);
                      } else {
                        attribute.value = submissionData[attribute.name];
                      }
                }
                if (attribute.attributeDef.attributeDef.readonly !== true){
                   modifiedAttributes.push(attribute);
                }

              break;
          }

      }
      //Update extended config
      let configAttribute=this.getUpdatedExtendedConfigAttribute();
      if(configAttribute!== undefined){
         modifiedAttributes.push(configAttribute);
      }

      //console.log(modifiedAttributes);
      return modifiedAttributes;
  }

  buildServiceItemAttributeForm(itemAttributes:Array<AttributeDto>):any{

      let formSpec:any = {submission:{'data':{}},formDefinition:{title:'Attribute Form',components:[]}};

      //let attr = itemAttributes.map(attr => new ServiceAttribute(attr));
      //console.log(attr);

      this.formDefinition={title:'Attribute Form',components:[]};
      this.itemAttributes=itemAttributes;
      this.loadSvcItemExtendedConfig();

      //Nur EndUser-visible Attribute
      let f = new UserVisibleAttributeFilterPipe();
      for (let attribute of f.transform(itemAttributes)){
          //console.log(attribute);
          switch(attribute._type){
              case "AttributeEnumDto":
                formSpec.formDefinition.components.push(this.getEnumAttributeComponent(attribute));
              break;
              case "AttributeStringDto":
                formSpec.formDefinition.components.push(this.getStringAttributeComponent(attribute));
              break;
          }
          formSpec.submission.data[attribute.name] = this.getAttributeValue(attribute);
      }

      //Submit-button
      let btn = new Button("updateAttributes");
      btn.label="Speichern";
      btn.action="event";
      btn.event="updateSvcItem";
      btn.disableOnInvalid=true;
      formSpec.formDefinition.components.push(btn);

      //console.log(formSpec.submission);
      return formSpec;
  }

  private getUpdatedExtendedConfigAttribute():any{
      let attribute =  this.getSvcItemExtendedConfigAttribute();
      if (attribute !== undefined){
          if (attribute._type === "AttributeStringDto"){
            attribute.value=JSON.stringify(this.svcItemConfig);
            return attribute;
          }
      }
      return undefined;
  }

  private getAttributeValue(attribute:any):string{
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
      }

      return attributeValue;

  }

  private getStringAttributeComponent(attribute:any){
      //console.log(attribute);


      let filterProperty:CustomPropertyDto = this.getCustomPropertyByName(attribute,constant.ATTRIBUTE_RENDERER);

      if (filterProperty===null){
          return this.getDefaultStringAttributeComponent(attribute);
      }
      switch(filterProperty.value){
          case constant.ATTRIBUTE_RENDERER_CONTACT:
            return this.getContactStringAttributeComponent(attribute);
          case constant.ATTRIBUTE_RENDERER_COMPANY:
            return this.getCompanyStringAttributeComponent(attribute);
          default:
            return this.getDefaultStringAttributeComponent(attribute);
      }

  }

  /**
   * Erzeugt ein Standard-Testeingabefeld
   *
   */
  private getDefaultStringAttributeComponent(attribute:any){
      let f = new SplTranslatePipe();
      let text = new TextField(attribute.name);
      text.label = f.transform(attribute.attributeDef.attributeDef.displayName);
      text.description = f.transform(attribute.attributeDef.attributeDef.description);

      if (this.isAttributeRequiredForStatus(attribute,'requiredOffered')){
         let validator = new ValidateDto();
         validator.required=true;
         validator.minLength=1;
         text.validate=validator;

      }

      if (attribute.attributeDef.attributeDef.readonly === true){
         text.disabled=true;
      }

      if (attribute.attributeDef.attributeType.mandatory === true){
          let validator = new ValidateDto();
          validator.required=true;
          validator.minLength=1;
          text.validate=validator;
      }

      return text;

  }

  /**
   * Erzeugt ein Eingabe-Feld, dass Personen durchsuchbar macht
   *
   */
  private getContactStringAttributeComponent(attribute:any):any{
      let f = new SplTranslatePipe();
      let component = new Select(attribute.name);
      component.label = f.transform(attribute.attributeDef.attributeDef.displayName);
      component.description = f.transform(attribute.attributeDef.attributeDef.description);
      component.dataSrc='url';
      component.setDataUrl('http://apis.witcom-dev.services/api/persons');
      component.searchField="q";
      component.template="<span>{{ item.firstName }} {{ item.name }}</span>";
      if (this.isAttributeRequiredForStatus(attribute,'requiredOffered')){
         let validator = new ValidateDto();
         validator.required=true;
         component.validate=validator;
      }

      return component;
  }

  /**
   * Erzeugt ein Eingabe-Feld, dass Firmen durchsuchbar macht
   *
   */
  private getCompanyStringAttributeComponent(attribute:any):any{
      let f = new SplTranslatePipe();
      let component = new Select(attribute.name);
      component.label = f.transform(attribute.attributeDef.attributeDef.displayName);
      component.description = f.transform(attribute.attributeDef.attributeDef.description);
      component.dataSrc='url';
      component.setDataUrl('http://apis.witcom-dev.services/api/organizations');
      component.searchField="q";
      component.template="<span>{{ item.company }}, {{ item.city }}</span>";
      if (this.isAttributeRequiredForStatus(attribute,'requiredOffered')){
         let validator = new ValidateDto();
         validator.required=true;
         component.validate=validator;
      }

      return component;
  }

  private getEnumAttributeComponent(attribute:any):any{


      let filterProperty:CustomPropertyDto = this.getCustomPropertyByName(attribute,constant.ATTRIBUTE_RENDERER);

      if ((filterProperty===null)||(filterProperty===undefined)){
          return this.getDefaultEnumAttributeComponent(attribute);
      }
      switch(filterProperty.value){
          case constant.ATTRIBUTE_RENDERER_BSAPRODUCT:
            return this.getBSAProductComponent(attribute);
          default:
            return this.getDefaultEnumAttributeComponent(attribute);
      }



  }

  private getDefaultEnumAttributeComponent(attribute:any):any{
      //Pre-Filter ?
      let filteredAttribute=this.preFilterAttributeValues(attribute);
      //console.log(filteredAttribute);

      let f = new SplTranslatePipe();
      //Build Form-Component
      let select = new Select(attribute.name);
      select.label = f.transform(attribute.attributeDef.attributeDef.displayName);
      select.description = f.transform(attribute.attributeDef.attributeDef.description);

      let valueList:any = attribute.attributeDef.attributeType.values.map(function (val){

          let dv = new DataValueDto(val.displayValue.defaultText,val.value);
          return dv;

      });
      select.setDataValues(valueList);

      //this.formDefinition.components.push(select);
      return select;
  }

  private getBSAProductComponent(attribute:any):any{
      //console.log(this.svcItemConfig);
      //BSA-Produkte filtern, nur das was verfuegbar ist anzeigen
      if (!this.svcItemConfig.hasOwnProperty(attribute.name)){
          throw Error('Keine BSA-Konfiguration auf Service-Item gefunden');
      }
      let config = this.svcItemConfig[attribute.name];
      if (!config.hasOwnProperty('availableBSAProducts')){
          throw Error('Konfigurationsfehler in SMDB - Konfigobjekt fehlerhaft - Property availableBSAProducts nicht vorhanden!');
      }
      if (!Array.isArray(config.availableBSAProducts)){
          throw Error('Konfigurationsfehler in SMDB - Konfigobjekt fehlerhaft - Property availableBSAProducts kein Array !');
      }
      if(config.availableBSAProducts.length == 0){
          throw Error('Keine BSA-Produklte verfuegbar!');
      }
      //get all values for the attribute that should be filtered
      let allValues:any = attribute.attributeDef.attributeType.values;
      //look for the values that have to filtered out
      let filteredValues = allValues.filter(function( obj ) {
            if (config.availableBSAProducts.includes(obj.value))
                return true;
            else
                return false;
      });
      //replace values with filtered list
      attribute.attributeDef.attributeType.values = filteredValues;

      return this.getDefaultEnumAttributeComponent(attribute);

  }

  /**
   * Gets the Attribute which stores the extended config
   *
   */
  private getSvcItemExtendedConfigAttribute():any{
     return this.itemAttributes.find(
        a => a.attributeDef.attributeDef.customProperties.properties.some(
            property => property.name === constant.ATTRIBUTE_PROPERTY_ISCONFIGSTORE && property.value === 'true'
        )
      );
  }

  //auslagern in svc-item-service
  private loadSvcItemExtendedConfig():void{
      /*
      let attribute = this.itemAttributes.find(
        a => a.attributeDef.attributeDef.customProperties.properties.some(
            property => property.name === 'attributeIsConfigStore' && property.value === 'true'
        )
      );*/
      let attribute =  this.getSvcItemExtendedConfigAttribute();
      if (attribute !== undefined){
          //console.log('got config attribute ', attribute);
          if ((attribute.value === null)||(attribute.value === "")){
             this.svcItemConfig={};
             return;
          }
          if (this.isAttributeStoredAsJSON(attribute)){
              this.svcItemConfig=JSON.parse(attribute.value);
              return;
          }
      }
      this.svcItemConfig={};
  }


  private isAttributeStoredAsJSON(attribute:any):boolean{
      let filterProperty:CustomPropertyDto = this.getCustomPropertyByName(attribute,'attributeStoredAsJson');
      if(filterProperty!==null){
          if(filterProperty.value==='true'){
              return true;
          }
      }
      return false;
  }
  private isAttributeRequiredForStatus(attribute:any,status:string):boolean{
      let filterProperty:CustomPropertyDto = this.getCustomPropertyByName(attribute,'attributeRequiredForStatus');
      if(filterProperty!==null){
          if(filterProperty.value===status){
              return true;
          }

      }
      return false;
  }

  private preFilterAttributeValues(attribute:any):any{
      //get Custom Property attributeFilter
      let filterProperty:CustomPropertyDto = this.getCustomPropertyByName(attribute,'attributeFilter');
      //if it exists, there might be a Pre-Filter
      if (filterProperty!=null){
          //double check if a filter exists
          if(filterProperty.value!="none"){
              //The filter/values to use as filter are stored in another attribute of service-item
              //The name of this attribute ist stored in the custom-property
              //console.log('looking for pre-filter in attribute ' + filterProperty.value);
              //get that attribute
              let filterAttribute = this.getAttributeByName(filterProperty.value);
              if(filterAttribute){
                //allowed values are stored as a delimited string
                if(filterAttribute.value !== null){
                    let filterElements:Array<string> = filterAttribute.value.split(";");
                    //get all values for the attribute that should be filtered
                    let allValues:any = attribute.attributeDef.attributeType.values;
                    //look for the values that have to filtered out
                    let filteredValues = allValues.filter(function( obj ) {
                        //console.log(filterElements);
                        if (filterElements.includes(obj.value))
                            return true;
                        else
                            return false;
                    });
                    //replace values with filtered list
                    attribute.attributeDef.attributeType.values = filteredValues;
                }

                }

          }

      }
      return attribute;

  }

  private isJsonString(str:string) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

  private getEnumAttributeValueByValue(attribute:any,value:string){
    return attribute.attributeDef.attributeType.values.find(a => a.value === value);
  }


  private getEnumAttributeValues(attribute:any){
      console.log(attribute.attributeDef.attributeType.values);
      return attribute.attributeDef.attributeType.values;
  }

  private getAttributeByName(name:string):any{
      return this.itemAttributes.find(a => a.name === name);
  }

  private getCustomPropertyByName(attribute:AttributeDto,propertyName:string):CustomPropertyDto{
      let customProperties:CustomPropertiesDto = attribute.attributeDef.attributeDef.customProperties;
      return customProperties.properties.find(i => i.name === propertyName);
  }

}
