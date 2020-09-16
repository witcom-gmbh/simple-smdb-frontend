import { Injectable } from '@angular/core';
import t from 'typy';
import * as attributeProcessorConfig from '../shared/attribute-processor-config';
import {AttributeProcessor} from '../shared/attribute-processor-config';
import { ServiceItemDto,AttributeDto,
  AttributeDefDto,
  CustomPropertiesDto,CustomPropertyDto,ContactRelationDto,ServiceItemMultiplicityDto,AttributeDefAssociationDto } from '../api/models';




@Injectable({
  providedIn: 'root'
})
export class AttributeProcessorService {

  constructor() { }

  private getProcessorById(processorId:string):AttributeProcessor{

    let processor = attributeProcessorConfig.attributeProcessors.find(p => p.id === processorId);
    if (t(processor).isNullOrUndefined){

      throw new Error('No processor-definition for ID' + processorId);
    }
    return processor;
  }

  private getDefaultStringProcessor():AttributeProcessor{
    let processorId:string = "DEFAULTSTRING";

    return this.getProcessorById(processorId);

  }

  private getDefaultEnumProcessor():AttributeProcessor{
    let processorId:string = "DEFAULTENUM";
    return this.getProcessorById(processorId);
  }

  private getDefaultDecimalProcessor():AttributeProcessor{
    let processorId:string = "DEFAULTDECIMAL";
    return this.getProcessorById(processorId);
  }

  /**
   * Get default processor for attribute based on AttributeType
   *
   * @param attribute
   */
  getDefaultProcessor(attribute:AttributeDto):AttributeProcessor{
    switch(attribute._type){
      case "AttributeEnumDto":
        return  this.getDefaultEnumProcessor();
      case "AttributeStringDto":
        return  this.getDefaultStringProcessor();
      case "AttributeDecimalDto":
        return  this.getDefaultDecimalProcessor();
      default:
        throw new Error('Unknown attribute-type ' + attribute._type);
    }
  }


  /**
   * Gets Processor-Definition for attribute
   *
   * @param processorId
   */
  getAttributeProcessor(processorProperty:CustomPropertyDto):AttributeProcessor{
    let processorId = null;

    if (!t(processorProperty,'value').isNullOrUndefined){
      processorId=processorProperty.value;
    } else {
      throw new Error('No processor-definition found');
    }
    return this.getProcessorById(processorId);

  }

  /**
   * Gets the name of the property that stores the defined attribute-processor
   */
  getProcessorProperty():string{
    return attributeProcessorConfig.processorProperty;

  }
}
