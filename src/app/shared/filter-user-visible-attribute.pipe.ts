import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'userVisibleAttributeFilter',
    pure: false
})
export class UserVisibleAttributeFilterPipe implements PipeTransform {
    transform(items: any[]): any {
        if (!items) {
            return items;
        }
        return items.filter(item => item.attributeDef.attributeDef.enduserVisible === true);
    }
}