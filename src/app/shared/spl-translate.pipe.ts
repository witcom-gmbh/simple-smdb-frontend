import { Pipe, PipeTransform } from '@angular/core';
import {MultiLingualStringDto} from '../api/models';

@Pipe({
  name: 'splTranslate'
})
export class SplTranslatePipe implements PipeTransform {

  transform(content: MultiLingualStringDto, language: string='de_DE'): string {
      
      if (content.hasOwnProperty('map')){
          if (content.map.hasOwnProperty(language)){
            return content.map[language];   
              
          } else {
            return content.defaultText;  
              
          }
          
      }
      
    return null;
  }

}
