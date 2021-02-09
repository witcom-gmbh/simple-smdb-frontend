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
    validAttributeTypes:Array<String>;
    valueHandler:ValueHandler;
}


export const processorProperty = "attributeProcessor";

export const attributeProcessors:Array<AttributeProcessor> = [

  {
        "id": "/attributeProcessor/simpleInput/textarea",
        "renderer": "TEXTAREA",

        "validAttributeTypes": [
            "AttributeStringDto"
        ],
        "valueHandler":ValueHandler.DEFAULT_STRING_HANDLER
    },
    {
        "id": "/attributeProcessor/simpleInput/booleanNumber",
        "renderer": "TOGGLEYN",

        "validAttributeTypes": [
            "AttributeDecimalDto"
        ],
        "valueHandler":ValueHandler.BOOLEAN_NUMBER_HANDLER
    },
    {
        "id": "/attributeProcessor/readOnly",
        "renderer": "DEFAULT",
        "validAttributeTypes": [
            "AttributeStringDto","AttributeEnumDto"
        ],
        "valueHandler":ValueHandler.DEFAULT_STRING_HANDLER
    },

    {
        "id": "/attributeProcessor/lookup/bsaProduct",
        "renderer": "BSAPRODUCT",
        "validAttributeTypes": [
            "AttributeEnumDto"
        ],
        "valueHandler":ValueHandler.CONFIG_ENUM_HANDLER
    },
    {
        "id": "/attributeProcessor/lookup/contact",
        "renderer": "CONTACT",
        "validAttributeTypes": [
            "AttributeStringDto"
        ],
        "valueHandler":ValueHandler.JSON_STRING_HANDLER
    },
    {
        "id": "/attributeProcessor/lookup/location",
        "renderer": "LOCATION",
        "validAttributeTypes": [
            "AttributeStringDto"
        ],
        "valueHandler":ValueHandler.JSON_STRING_HANDLER
    },
    {
        "id": "/attributeProcessor/lookup/company",
        "renderer": "DEFAULT",
        "validAttributeTypes": [
            "AttributeStringDto"
        ],
        "valueHandler":ValueHandler.JSON_STRING_HANDLER
    },
    {
        "id": "/attributeProcessor/readOnly/locationReadOnly",
        "renderer": "DEFAULT",
        "validAttributeTypes": [
            "AttributeStringDto"
        ],
        "valueHandler":ValueHandler.JSON_STRING_HANDLER
    },
    {
        "id": "/attributeProcessor/serviceAccess",
        "renderer": "DEFAULT",
        "validAttributeTypes": [
            "AttributeStringDto"
        ],
        "valueHandler":ValueHandler.JSON_STRING_HANDLER
    },
    {
        "id": "/attributeProcessor/serviceAccess/fibreAccess",
        "renderer": "DEFAULT",
        "validAttributeTypes": [
            "AttributeStringDto"
        ],
        "valueHandler":ValueHandler.JSON_STRING_HANDLER
    },
    {
        "id": "/attributeProcessor/serviceAccess/wholebuy",
        "renderer": "DEFAULT",
        "validAttributeTypes": [
            "AttributeStringDto"
        ],
        "valueHandler":ValueHandler.JSON_STRING_HANDLER
    },
    {
        "id": "/attributeProcessor/serviceAccess/IPBSA",
        "renderer": "BSAPRODUCT",
        "validAttributeTypes": [
            "AttributeEnumDto"
        ],
        "valueHandler":ValueHandler.CONFIG_ENUM_HANDLER
    },
    {
        "id": "DEFAULTSTRING",
        "renderer": "DEFAULT",
        "validAttributeTypes": [
            "AttributeStringDto"
        ],
        "valueHandler":ValueHandler.DEFAULT_STRING_HANDLER
    },
    {
        "id": "DEFAULTENUM",
        "renderer": "DEFAULT",
        "validAttributeTypes": [
            "AttributeEnumDto"
        ],
        "valueHandler":ValueHandler.DEFAULT_ENUM_HANDLER
    },
    {
        "id": "DEFAULTDECIMAL",
        "renderer": "DEFAULT",
        "validAttributeTypes": [
            "AttributeDecimalDto"
        ],
        "valueHandler":ValueHandler.DEFAULT_NUMBER_HANDLER
    }


];
