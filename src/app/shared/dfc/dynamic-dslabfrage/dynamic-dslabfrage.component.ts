import { Component, EventEmitter, Inject, Input, Optional, Output, ViewChild } from "@angular/core";
import { FormGroup } from "@angular/forms";
import {
    DynamicFormControlComponent,
    DynamicFormControlCustomEvent,
    DynamicFormLayout,
    DynamicFormLayoutService,
    DynamicFormValidationService,
    DynamicFormValueControlModelConfig,
    DynamicFormValueControlModel,
    DynamicFormControlLayout,
    serializable 
} from "@ng-dynamic-forms/core";
import {
    ErrorStateMatcher,
    LabelOptions,
    MAT_AUTOCOMPLETE_DEFAULT_OPTIONS,
    MAT_LABEL_GLOBAL_OPTIONS,
    MAT_RIPPLE_GLOBAL_OPTIONS,
    MatAutocomplete,
    MatAutocompleteDefaultOptions,
    MatInput,
    RippleGlobalOptions
} from "@angular/material";

import { DslAbfrageComponent,DSLAbfrageProdukt,DSLAbfrageResult } from '../dfc';

export const DYNAMIC_FORM_CONTROL_TYPE_DSLABFRAGE = "DSLABFRAGE";

export interface DynamicDslAbfrageControlModelConfig extends DynamicFormValueControlModelConfig<DSLAbfrageResult> {
    selectableBSAProducts?:DSLAbfrageProdukt[];
    
}

export class DynamicDslAbfrageControlModel extends DynamicFormValueControlModel<DSLAbfrageResult> {
    
    @serializable() selectableBSAProducts:DSLAbfrageProdukt[];
    
    @serializable() readonly type: string = DYNAMIC_FORM_CONTROL_TYPE_DSLABFRAGE;
     
    constructor(config: DynamicDslAbfrageControlModelConfig, layout?: DynamicFormControlLayout) {
        super(config, layout);

        this.selectableBSAProducts = config.selectableBSAProducts || [];

    }

    
}

@Component({
  selector: 'app-dynamic-dslabfrage',
  templateUrl: './dynamic-dslabfrage.component.html',
  styleUrls: ['./dynamic-dslabfrage.component.css']
})
export class DynamicDSLAbfrageComponent extends DynamicFormControlComponent {
    
    @Input() group: FormGroup;
    @Input() layout: DynamicFormLayout;
    @Input() model: DynamicDslAbfrageControlModel;

    @Output() blur: EventEmitter<any> = new EventEmitter();
    @Output() change: EventEmitter<any> = new EventEmitter();
    @Output() customEvent: EventEmitter<DynamicFormControlCustomEvent> = new EventEmitter();
    @Output() focus: EventEmitter<any> = new EventEmitter();
    
    //@ViewChild(DslAbfrageComponent) dslAbfrageComponent: DslAbfrageComponent;
    @ViewChild("autoAddress") matAutocomplete: MatAutocomplete;
    @ViewChild(MatInput) matInput: MatInput;

  constructor(protected layoutService: DynamicFormLayoutService,
                protected validationService: DynamicFormValidationService,
                @Inject(ErrorStateMatcher) public errorStateMatcher: ErrorStateMatcher,
                @Inject(MAT_AUTOCOMPLETE_DEFAULT_OPTIONS) public AUTOCOMPLETE_OPTIONS: MatAutocompleteDefaultOptions,
                @Inject(MAT_LABEL_GLOBAL_OPTIONS) @Optional() public LABEL_OPTIONS: LabelOptions,
                @Inject(MAT_RIPPLE_GLOBAL_OPTIONS) @Optional() public RIPPLE_OPTIONS: RippleGlobalOptions) {

        super(layoutService, validationService);
                
    }

}
