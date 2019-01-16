import { Component, OnInit,Input, OnChanges, SimpleChange } from '@angular/core';
import { FormGroup } from "@angular/forms";
import { DynamicFormModel, DynamicFormService } from "@ng-dynamic-forms/core";
import {MockApiSearchService} from '../../services/mock-api-search.service'
import {
    DynamicCheckboxModel,
    DynamicInputModel,
    DynamicRadioGroupModel
} from "@ng-dynamic-forms/core";

import { ServiceItemDto,AttributeDto } from '../../api/models';
import { ServiceItemService } from '../../services/service-item.service';
import { MessageService } from '../../services/message.service';
import { ServiceItemFormBuilder} from './service-item-form-builder.service'

@Component({
  selector: 'service-item-editor',
  templateUrl: './service-item-editor.component.html',
  styleUrls: ['./service-item-editor.component.css']
})
export class ServiceItemEditorComponent implements OnInit {

    @Input() itemId:number;
    
    formModel: DynamicFormModel;
    formGroup: FormGroup;
    requiredContactRoles:string[] = ['contactCommercial'];
    private serviceItem:ServiceItemDto;
    
    
    constructor(
        private formService: DynamicFormService,
        private messageService:MessageService,
        private mockSearchService:MockApiSearchService,
        private servicItemService:ServiceItemService,
        private serviceItemFormBuilder:ServiceItemFormBuilder
    ) { }

    ngOnInit() {
    }
  
    ngOnChanges() {
        /*
        this.mockSearchService.search("http://apis.witcom-dev.services/api/persons","carst").subscribe(
        res => {
            console.log(res);
            }
        );*/
       
        this.formModel = [];
        
        //console.log(this.formModel); 
        this.servicItemService.getItemById(this.itemId).subscribe(
        response => {
            this.serviceItem=response;
            /*
            this.serviceItemFormBuilder.getFormSpec(response).subscribe(form => {
                console.log(form);
                //this.formModel = form;
                //console.log(this.formModel); 
                this.formGroup = this.formService.createFormGroup(this.formModel);
            });*/
            this.serviceItemFormBuilder.getFormModel(response).subscribe(res =>{
                //console.log(res)
                this.formModel = res;
                this.formGroup = this.formService.createFormGroup(this.formModel);
            });
        },
        err => {
           console.log(err);
           this.messageService.add(err)
        });
        

      
    }
    
    onBlur($event) {
        console.log(`Material blur event on: ${$event.model.id}: `, $event);
    }

    onChange($event) {
        console.log(`Material change event on: ${$event.model.id}: `, $event);
    }

    onFocus($event) {
        console.log(`Material focus event on: ${$event.model.id}: `, $event);
    }

    onMatEvent($event) {
        console.log(`Material ${$event.type} event on: ${$event.model.id}: `, $event);
    }



}
