import { SimpleProductAttrDefinition } from "./simple-product-attr-definition";
import { DiscountItemDto } from "../api/models";

export interface AttributePrice {
  attribute:SimpleProductAttrDefinition;
  price:DiscountItemDto;
}
