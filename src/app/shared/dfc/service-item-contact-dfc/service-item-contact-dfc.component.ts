import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
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

export const DYNAMIC_FORM_CONTROL_TYPE_SVCITEMCONTACT = "SVCITEMCONTACT";

export interface ServiceItemContactDFCControlModelConfig extends DynamicFormValueControlModelConfig<string> {
    itemId:number;
    requiredContactRoles?:string[];
    
}

export class ServiceItemContactDFCControlModel extends DynamicFormValueControlModel<string> {
    
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

    constructor(protected layoutService: DynamicFormLayoutService,
                protected validationService: DynamicFormValidationService) {

        super(layoutService, validationService);
                
    }

}
