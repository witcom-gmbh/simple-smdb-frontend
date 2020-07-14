import { NgModule,Provider,Type } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MAT_CHIPS_DEFAULT_OPTIONS, MatCardModule, MatNativeDateModule,MatAutocompleteModule,MatFormFieldModule,
  MatInputModule,MatSelectModule,MatChipsModule } from "@angular/material";
import { AppMaterialModule } from '../shared/app-material.module';

import { DynamicFormsCoreModule } from "@ng-dynamic-forms/core";
import { DynamicFormsMaterialUIModule } from "@ng-dynamic-forms/ui-material";

import { ServiceConfigComponent } from './service-config/service-config.component';
import { ServiceItemValidationService } from './shared/service-item-validation.service';

export { ServiceConfigComponent } from './service-config/service-config.component';
export { ServiceItemValidationService } from './shared/service-item-validation.service';

import { AppRoutingModule } from '../app-routing.module';
import {SharedModule} from '../shared/shared.module';
import { FormioModule } from 'angular-formio';
import { ServiceItemEditorComponent } from './shared/service-item-editor.component';
import { FormTestComponent } from './form-test/form-test.component';
//import { ServiceItemContactsComponent} from '../shared/dfc/dfc';
import { DfcModule } from '../shared/dfc/dfc';

import { ServicePriceComponent } from './shared/service-price/service-price.component';
import { TestInstantiateComponent } from './shared/test-instantiate/test-instantiate.component';
import { SimpleServiceSearchComponent } from './shared/simple-service-search/simple-service-search.component'
@NgModule({

  declarations: [ServiceConfigComponent, ServiceItemEditorComponent,
    FormTestComponent,
    ServicePriceComponent,
    TestInstantiateComponent,
    SimpleServiceSearchComponent,
    ],
  imports: [
    CommonModule,
    AppRoutingModule,
    SharedModule,
    FormioModule,
    DynamicFormsCoreModule,
    DynamicFormsMaterialUIModule,
    AppMaterialModule,
    /*
    MatNativeDateModule,
    MatCardModule,
    MatAutocompleteModule,MatFormFieldModule,MatInputModule,MatSelectModule,MatChipsModule,*/
    DfcModule
  ],
  exports: [
    ServiceConfigComponent,
    ServiceItemEditorComponent,
    ServicePriceComponent,
    TestInstantiateComponent,
    SimpleServiceSearchComponent
  ]
})
export class ServicemgmtModule { }
