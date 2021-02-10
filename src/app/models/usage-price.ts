import { AttributeDefDto, AccountingTypeDto, MoneyDto } from "../api/models";
import { SimpleProductAttrDefinition } from "./simple-product-attr-definition";

export interface UsagePrice {

  attribute:SimpleProductAttrDefinition;
  accountingType:AccountingTypeDto;
  usage:number;
  pricePerUnit:MoneyDto;
  calculatedPrice:MoneyDto;

}

