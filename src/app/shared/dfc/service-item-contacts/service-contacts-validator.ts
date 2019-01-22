import { ControlValueAccessor, NG_VALUE_ACCESSOR,NG_VALIDATORS } from '@angular/forms';
import {FormControl,ValidationErrors,AbstractControl,ValidatorFn} from '@angular/forms';
import { ContactTypeDto,PartnerDto } from '../../../api/models';
import {CONTACT_TYPES} from './contact-types';

export function serviceContactsValidator(requiredContactRoles:string[]): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
      if(!Array.isArray(requiredContactRoles)){
            return null;
      }
      let selectedTypes = [].concat.apply([], control.value.map(rel => rel.contactTypes)).map(contactType=>contactType.name).reduce(function(a,b){if(a.indexOf(b)<0)a.push(b);return a;},[]);
      let check = requiredContactRoles.every(function checkIfArrIncludesElm(elm) {
		return selectedTypes.includes(elm);
	  });
      return check ? null: {'serviceContacts': {value: control.value}};
  };
}
