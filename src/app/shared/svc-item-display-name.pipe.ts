import { Pipe, PipeTransform } from '@angular/core';
import { ServiceItemDto } from '../api/models';

@Pipe({
  name: 'svcItemDisplayName'
})
export class SvcItemDisplayNamePipe implements PipeTransform {

  transform(svcItem: ServiceItemDto): string {
      if (svcItem.roleDisplayName !== null){
         return svcItem.roleDisplayName;
     } 
     return svcItem.displayName;
  }

}
