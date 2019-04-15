import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import {UserVisibleAttributeFilterPipe} from './filter-user-visible-attribute.pipe';
import { SvcItemDisplayNamePipe } from './svc-item-display-name.pipe';
import { SplTranslatePipe } from './spl-translate.pipe';
import { SimpleUserInfoComponent } from './simple-user-info/simple-user-info.component';
export {UserVisibleAttributeFilterPipe} from './filter-user-visible-attribute.pipe';
export { SplTranslatePipe } from './spl-translate.pipe';




@NgModule({
  declarations: [
  UserVisibleAttributeFilterPipe,
  SvcItemDisplayNamePipe,
  SplTranslatePipe,
  SimpleUserInfoComponent 
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  exports:[
    
    ReactiveFormsModule,
    UserVisibleAttributeFilterPipe,
    SvcItemDisplayNamePipe,
    SplTranslatePipe,
    SimpleUserInfoComponent

  ]
})
export class SharedModule { }
