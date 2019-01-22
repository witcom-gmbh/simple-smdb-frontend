import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild,Inject,Optional } from "@angular/core";
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
import { ServiceItemContactsComponent } from '../service-item-contacts/service-item-contacts.component';
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
import { ContactRelationDto,ServiceItemDto,AttributeDto,ContactTypeDto,PartnerDto,ContactDto } from '../../../api/models';
export const DYNAMIC_FORM_CONTROL_TYPE_SVCITEMCONTACT = "SVCITEMCONTACT";

export interface ServiceItemContactDFCControlModelConfig extends DynamicFormValueControlModelConfig<Array<ContactRelationDto>> {
    itemId:number;
    requiredContactRoles?:string[];
    
}

export class ServiceItemContactDFCControlModel extends DynamicFormValueControlModel<Array<ContactRelationDto>> {
    
    @serializable() itemId:number;
    @serializable() requiredContactRoles:string[];
    
    @serializable() readonly type: string = DYNAMIC_FORM_CONTROL_TYPE_SVCITEMCONTACT;

     
    constructor(config: ServiceItemContactDFCControlModelConfig, layout?: DynamicFormControlLayout) {
        super(config, layout);
        this.itemId = config.itemId;
        this.requiredContactRoles = config.requiredContactRoles || [];

    }

    
}


@Component({
  selector: 'service-item-contact-dfc',
  templateUrl: './service-item-contact-dfc.component.html',
  styleUrls: ['./service-item-contact-dfc.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServiceItemContactDFCComponent extends DynamicFormControlComponent {
    
    @Input() group: FormGroup;
    @Input() layout: DynamicFormLayout;
    @Input() model: ServiceItemContactDFCControlModel;

    @Output() blur: EventEmitter<any> = new EventEmitter();
    @Output() change: EventEmitter<any> = new EventEmitter();
    @Output() customEvent: EventEmitter<DynamicFormControlCustomEvent> = new EventEmitter();
    @Output() focus: EventEmitter<any> = new EventEmitter();
    
    //@ViewChild(ServiceItemContactsComponent) serviceItemContactsComponent: ServiceItemContactsComponent;
    @ViewChild("autoContact") matAutocompleteContact: MatAutocomplete;
    @ViewChild("autoPartner") matAutocompletePartner: MatAutocomplete;
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
