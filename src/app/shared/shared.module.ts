import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule,NG_VALIDATORS } from "@angular/forms";
import { FormsModule } from '@angular/forms';
import {UserVisibleAttributeFilterPipe} from './filter-user-visible-attribute.pipe';
import { SvcItemDisplayNamePipe } from './svc-item-display-name.pipe';
import { SplTranslatePipe } from './spl-translate.pipe';
import { SimpleUserInfoComponent } from './simple-user-info/simple-user-info.component';
import {ServiceAccessAvailabilityCheckComponent} from './components/service-access-availability-check.component';
import {AppMaterialModule} from './app-material.module';
export {UserVisibleAttributeFilterPipe} from './filter-user-visible-attribute.pipe';
export { SplTranslatePipe } from './spl-translate.pipe';

@NgModule({
  declarations: [
  UserVisibleAttributeFilterPipe,
  SvcItemDisplayNamePipe,
  SplTranslatePipe,
  SimpleUserInfoComponent,
  ServiceAccessAvailabilityCheckComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AppMaterialModule
  ],
  exports:[

    ReactiveFormsModule,
    FormsModule,
    UserVisibleAttributeFilterPipe,
    SvcItemDisplayNamePipe,
    SplTranslatePipe,
    SimpleUserInfoComponent,
    ServiceAccessAvailabilityCheckComponent
  ]
})
export class SharedModule { }
