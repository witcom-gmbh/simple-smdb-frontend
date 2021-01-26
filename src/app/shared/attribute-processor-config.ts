import {ValueHandler} from '../servicemgmt/shared/value-handler.enum';
/**
 * Model
 *
 * Todo: ESSPecs
 *
 */



export interface AttributeProcessor {
    id:String,
    renderer: String,
    storeFormat: 'PLAIN' | 'JSON' | 'EXTENDED';
    validAttributeTypes:Array<String>;
    valueHandler:ValueHandler;
}


export const processorProperty = "attributeProcessor";

export const attributeProcessors:Array<AttributeProcessor> = [

  {
        "id": "/attributeProcessor/simpleInput/textarea",
        "renderer": "TEXTAREA",
        "storeFormat": "PLAIN",

        "validAttributeTypes": [
            "AttributeStringDto"
        ],
        "valueHandler":ValueHandler.DEFAULT_STRING_HANDLER
    },
    {
        "id": "/attributeProcessor/readOnly",
        "renderer": "DEFAULT",
        "storeFormat": "PLAIN",
        "validAttributeTypes": [
            "AttributeStringDto","AttributeEnumDto"
        ],
        "valueHandler":ValueHandler.DEFAULT_STRING_HANDLER
    },
    {
        "id": "/attributeProcessor/lookup/bsaProduct",
        "renderer": "BSAPRODUCT",
        "storeFormat": "EXTENDED",
        "validAttributeTypes": [
            "AttributeEnumDto"
        ],
        "valueHandler":ValueHandler.CONFIG_ENUM_HANDLER
    },
    {
        "id": "/attributeProcessor/lookup/contact",
        "renderer": "CONTACT",
        "storeFormat": "JSON",
        "validAttributeTypes": [
            "AttributeStringDto"
        ],
        "valueHandler":ValueHandler.JSON_STRING_HANDLER
    },
    {
        "id": "/attributeProcessor/lookup/location",
        "renderer": "LOCATION",
        "storeFormat": "JSON",
        "validAttributeTypes": [
            "AttributeStringDto"
        ],
        "valueHandler":ValueHandler.JSON_STRING_HANDLER
    },
    {
        "id": "/attributeProcessor/lookup/company",
        "renderer": "DEFAULT",
        "storeFormat": "PLAIN",
        "validAttributeTypes": [
            "AttributeStringDto"
        ],
        "valueHandler":ValueHandler.JSON_STRING_HANDLER
    },
    {
        "id": "/attributeProcessor/readOnly/locationReadOnly",
        "renderer": "DEFAULT",
        "storeFormat": "PLAIN",
        "validAttributeTypes": [
            "AttributeStringDto"
        ],
        "valueHandler":ValueHandler.JSON_STRING_HANDLER
    },
    {
        "id": "/attributeProcessor/serviceAccess",
        "renderer": "DEFAULT",
        "storeFormat": "JSON",
        "validAttributeTypes": [
            "AttributeStringDto"
        ],
        "valueHandler":ValueHandler.JSON_STRING_HANDLER
    },
    {
        "id": "/attributeProcessor/serviceAccess/fibreAccess",
        "renderer": "DEFAULT",
        "storeFormat": "PLAIN",
        "validAttributeTypes": [
            "AttributeStringDto"
        ],
        "valueHandler":ValueHandler.JSON_STRING_HANDLER
    },
    {
        "id": "/attributeProcessor/serviceAccess/wholebuy",
        "renderer": "DEFAULT",
        "storeFormat": "PLAIN",
        "validAttributeTypes": [
            "AttributeStringDto"
        ],
        "valueHandler":ValueHandler.JSON_STRING_HANDLER
    },
    {
        "id": "/attributeProcessor/serviceAccess/IPBSA",
        "renderer": "BSAPRODUCT",
        "storeFormat": "EXTENDED",
        "validAttributeTypes": [
            "AttributeEnumDto"
        ],
        "valueHandler":ValueHandler.CONFIG_ENUM_HANDLER
    },
    {
        "id": "DEFAULTSTRING",
        "renderer": "DEFAULT",
        "storeFormat": "PLAIN",
        "validAttributeTypes": [
            "AttributeStringDto"
        ],
        "valueHandler":ValueHandler.DEFAULT_STRING_HANDLER
    },
    {
        "id": "DEFAULTENUM",
        "renderer": "DEFAULT",
        "storeFormat": "PLAIN",
        "validAttributeTypes": [
            "AttributeEnumDto"
        ],
        "valueHandler":ValueHandler.DEFAULT_ENUM_HANDLER
    },
    {
        "id": "DEFAULTDECIMAL",
        "renderer": "DEFAULT",
        "storeFormat": "PLAIN",
        "validAttributeTypes": [
            "AttributeDecimalDto"
        ],
        "valueHandler":ValueHandler.DEFAULT_NUMBER_HANDLER
    }


];
