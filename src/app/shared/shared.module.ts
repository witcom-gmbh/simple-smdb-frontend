import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MessagesComponent } from './messages/messages.component';
import {UserVisibleAttributeFilterPipe} from './filter-user-visible-attribute.pipe';
import { SvcItemDisplayNamePipe } from './svc-item-display-name.pipe';
import { SplTranslatePipe } from './spl-translate.pipe';
//export {UserVisibleAttributeFilterPipe} from './filter-user-visible-attribute.pipe';

@NgModule({
  declarations: [MessagesComponent,
  UserVisibleAttributeFilterPipe,
  SvcItemDisplayNamePipe,
  SplTranslatePipe 
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule

  ],
  exports:[
    MessagesComponent,
    ReactiveFormsModule,
    UserVisibleAttributeFilterPipe,
    SvcItemDisplayNamePipe,
    SplTranslatePipe

  ]
})
export class SharedModule { }
