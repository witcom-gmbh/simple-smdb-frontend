import { AttributeDefDto, AccountingTypeDto, MoneyDto } from "../api/models";

export interface UsagePrice {

  attribute:AttributeDefDto;
  accountingType:AccountingTypeDto;
  usage:number;
  pricePerUnit:MoneyDto;
  calculatedPrice:MoneyDto;

}

