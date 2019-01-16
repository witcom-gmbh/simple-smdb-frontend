import { ServiceItemDto,AttributeDto,CustomPropertiesDto,CustomPropertyDto } from '../../api/models';

export class ServiceAttribute {
    
    private attributeDto:any;
    private name:string;
    private _type:string;
    
    constructor(attributeDto:AttributeDto) {
        this.attributeDto = attributeDto;
        this.name = attributeDto.name;
        this._type = attributeDto._type;
        
    }
    
    /**
     * Get Value-Object of EnumAttribute by Value-Systemname
     */
    private getEnumAttributeValueByValue(value:string){
        return this.attributeDto.attributeDef.attributeType.values.find(a => a.value === value);      
    }
    
    /**
     * Get all EnumAttributeValues on an attribute
     * 
     */
    private getEnumAttributeValues(){
        //console.log(attribute.attributeDef.attributeType.values);
        return this.attributeDto.attributeDef.attributeType.values;
    }
    
    /**
     * Get custom property of attribute by propertyName
     * 
     */
    private getCustomPropertyByName(propertyName:string):CustomPropertyDto{
        let customProperties:any = this.attributeDto.attributeDef.attributeDef.customProperties;
        return customProperties.properties.find(i => i.name === propertyName);
    }
    
    /**
     * Cheks if Attribute-Value is stored as JSON
     * 
     */
    private isAttributeStoredAsJSON(attribute:any):boolean{
        let filterProperty:CustomPropertyDto = this.getCustomPropertyByName('attributeStoredAsJson');
        if(filterProperty!==null){
              if(filterProperty.value==='true'){
                  return true;
              }
        }
        return false;
    }
    
    /**
     * Checks if attribute is required for service-item-status
     * 
     */
    private isAttributeRequiredForStatus(attribute:any,status:string):boolean{
        let filterProperty:CustomPropertyDto = this.getCustomPropertyByName('attributeRequiredForStatus');
        if(filterProperty!==null){
              if(filterProperty.value===status){
                  return true;
              }
        
          }
        return false;
    }
    
    
}
