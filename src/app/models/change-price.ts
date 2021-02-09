import { SimpleProductAttrDefinition } from "./simple-product-attr-definition";
import { DiscountItemDto } from "../api/models";

export interface ChangePrice {
  attribute:SimpleProductAttrDefinition;
  price:DiscountItemDto;
}
