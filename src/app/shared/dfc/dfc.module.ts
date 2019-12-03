import { NgModule,Provider,Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule,NG_VALIDATORS } from "@angular/forms";
import { FormsModule } from '@angular/forms';
import {SharedModule} from '../shared.module';

import {
    MAT_CHIPS_DEFAULT_OPTIONS,
    MatCardModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatIconModule
} from "@angular/material";

import { DYNAMIC_FORM_CONTROL_MAP_FN } from "@ng-dynamic-forms/core";
import {
    DynamicMaterialFormArrayComponent,
    DynamicMaterialCheckboxComponent,
    DynamicMaterialFormGroupComponent,
    DynamicMaterialDatePickerComponent,
    DynamicMaterialChipsComponent,
    DynamicMaterialInputComponent,
    DynamicMaterialRadioGroupComponent,
    DynamicMaterialSelectComponent,
    DynamicMaterialSliderComponent,
    DynamicMaterialSlideToggleComponent,
    DynamicMaterialTextAreaComponent
} from "@ng-dynamic-forms/ui-material";
import {
    DYNAMIC_FORM_CONTROL_TYPE_ARRAY,
    DYNAMIC_FORM_CONTROL_TYPE_CHECKBOX,
    DYNAMIC_FORM_CONTROL_TYPE_CHECKBOX_GROUP,
    DYNAMIC_FORM_CONTROL_TYPE_DATEPICKER,
    DYNAMIC_FORM_CONTROL_TYPE_GROUP,
    DYNAMIC_FORM_CONTROL_TYPE_INPUT,
    DYNAMIC_FORM_CONTROL_TYPE_RADIO_GROUP,
    DYNAMIC_FORM_CONTROL_TYPE_SELECT,
    DYNAMIC_FORM_CONTROL_TYPE_SLIDER,
    DYNAMIC_FORM_CONTROL_TYPE_SWITCH,
    DYNAMIC_FORM_CONTROL_TYPE_TEXTAREA,
    DynamicFormArrayGroupModel,
    DynamicFormControl,
    DynamicFormControlContainerComponent,
    DynamicFormControlEvent,
    DynamicFormControlModel,
    DynamicFormLayout,
    DynamicFormLayoutService,
    DynamicFormValidationService,
    DynamicInputModel,
    DynamicTemplateDirective,
} from "@ng-dynamic-forms/core";

import { ServiceItemContactsComponent } from './service-item-contacts/service-item-contacts.component';
import { serviceContactsValidator } from './service-item-contacts/service-contacts-validator';

import { RequiredContactRolesComponent } from './required-contact-roles/required-contact-roles.component';
import { DslAbfrageComponent } from "./dsl-abfrage/dsl-abfrage.component"
import { DslRechercheService } from "./dsl-abfrage/dsl-recherche.service";


import { ServiceItemContactDFCComponent,DYNAMIC_FORM_CONTROL_TYPE_SVCITEMCONTACT } from './service-item-contact-dfc/service-item-contact-dfc.component';
import { DynamicDSLAbfrageComponent,DYNAMIC_FORM_CONTROL_TYPE_DSLABFRAGE } from './dynamic-dslabfrage/dynamic-dslabfrage.component';

export function getDFCComponent(model: DynamicFormControlModel): Type<DynamicFormControl>{

  switch (model.type) {

  case DYNAMIC_FORM_CONTROL_TYPE_SVCITEMCONTACT:
    return ServiceItemContactDFCComponent;

  case DYNAMIC_FORM_CONTROL_TYPE_DSLABFRAGE:
      return DynamicDSLAbfrageComponent;
  }

}

@NgModule({
    entryComponents: [ServiceItemContactDFCComponent,DynamicDSLAbfrageComponent],
    providers: [
        {provide: DYNAMIC_FORM_CONTROL_MAP_FN,useValue:getDFCComponent},
        DslRechercheService,
        {provide: NG_VALIDATORS, useValue: serviceContactsValidator, multi: true}

    ],
    declarations: [
        ServiceItemContactDFCComponent,
        ServiceItemContactsComponent,
        RequiredContactRolesComponent,
        DslAbfrageComponent,
        DynamicDSLAbfrageComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        MatNativeDateModule,
        MatCardModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatChipsModule,
        SharedModule ,
        MatSlideToggleModule,
        MatButtonToggleModule,
        MatCheckboxModule,
        MatIconModule

    ],
    exports: [
        ServiceItemContactsComponent,
        RequiredContactRolesComponent,
        ServiceItemContactDFCComponent,
        DslAbfrageComponent,


    ]
})
export class DfcModule { }
