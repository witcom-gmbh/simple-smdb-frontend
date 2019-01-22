import { NgModule,Provider,Type } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MAT_CHIPS_DEFAULT_OPTIONS, MatCardModule, MatNativeDateModule,MatAutocompleteModule,MatFormFieldModule,
  MatInputModule,MatSelectModule,MatChipsModule } from "@angular/material";
import { DynamicFormsCoreModule } from "@ng-dynamic-forms/core";
import { DynamicFormsMaterialUIModule } from "@ng-dynamic-forms/ui-material";

import { ServiceConfigComponent } from './service-config/service-config.component';
import { ServiceItemValidationService } from './shared/service-item-validation.service';

export { ServiceConfigComponent } from './service-config/service-config.component';
export { ServiceItemValidationService } from './shared/service-item-validation.service';

import { AppRoutingModule } from '../app-routing.module';
import { SvcitemConfigComponent } from './svcitem-config/svcitem-config.component';
import {SharedModule} from '../shared/shared.module';
import { FormioModule } from 'angular-formio';
import { ServiceItemEditorComponent } from './shared/service-item-editor.component';
import { FormTestComponent } from './form-test/form-test.component';
//import { ServiceItemContactsComponent} from '../shared/dfc/dfc';
import { DfcModule } from '../shared/dfc/dfc';
import { ServicePriceComponent } from './shared/service-price/service-price.component'
@NgModule({
    
  declarations: [ServiceConfigComponent, SvcitemConfigComponent, ServiceItemEditorComponent,
    FormTestComponent,
    ServicePriceComponent,
    ],
  imports: [
    CommonModule,
    AppRoutingModule,
    SharedModule,
    FormioModule,
    DynamicFormsCoreModule,
    DynamicFormsMaterialUIModule,
    /*
    MatNativeDateModule,
    MatCardModule,
    MatAutocompleteModule,MatFormFieldModule,MatInputModule,MatSelectModule,MatChipsModule,*/
    DfcModule
  ],
  exports: [
    ServiceConfigComponent,
    SvcitemConfigComponent,
    ServiceItemEditorComponent,
    ServicePriceComponent 
  ]
}) 
export class ServicemgmtModule { }
