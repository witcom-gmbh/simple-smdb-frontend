import { AccountingTypeDto, MoneyDto } from "../api/models";
import { SimpleProductAttrDefinition } from "./simple-product-attr-definition";

export interface FreestylePrice {

  attribute:SimpleProductAttrDefinition;
  accountingType:AccountingTypeDto;
  price:MoneyDto;

}

