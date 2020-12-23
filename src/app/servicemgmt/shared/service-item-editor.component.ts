import { Component, OnInit,Input, OnChanges, SimpleChange } from '@angular/core';
import { FormGroup,ValidationErrors } from "@angular/forms";
import { catchError } from 'rxjs/operators';
import { forkJoin,of} from 'rxjs';
import t from 'typy';
import { AlertService } from 'ngx-alerts';
import { NGXLogger } from 'ngx-logger';
import { DynamicFormModel, DynamicFormService } from "@ng-dynamic-forms/core";
import {MockApiSearchService} from '../../services/mock-api-search.service'
import {
    DynamicCheckboxModel,
    DynamicInputModel,
    DynamicRadioGroupModel
} from "@ng-dynamic-forms/core";

import { ServiceItemDto,AttributeDto,ServiceItemMultiplicityDto } from '../../api/models';
import { SmdbPartnerService} from '../../services/smdb-partner.service';

import { ServiceItemService,ProductService,SmdbScriptService} from '../../services/services';

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
    public serviceItem:ServiceItemDto;
    private itemAttributes:AttributeDto[]=null;


    constructor(
        private logger: NGXLogger,
        private formService: DynamicFormService,
        private alertService: AlertService,
        private mockSearchService:MockApiSearchService,
        private servicItemService:ServiceItemService,
        private smdbPartnerService: SmdbPartnerService,
        private serviceItemFormBuilder:ServiceItemFormBuilder,
        private productService: ProductService,
        private scriptService: SmdbScriptService
    ) {
    }
    ngOnInit() {
    }

    ngOnChanges() {


        this.formModel = [];
        this.serviceItemFormBuilder.setServiceTransition("toOffered");

        //console.log(this.formModel);
        this.servicItemService.getItemById(this.itemId).subscribe(
        response => {
            this.serviceItem=response;
            //Get Attributes & Contacts
            forkJoin(
                this.servicItemService.getItemAttributes(this.serviceItem.id),
                this.servicItemService.getContactRelations(this.serviceItem.id),
                this.servicItemService.getChildrenMultiplicity(this.serviceItem.id),
                this.productService.getAttributeDefByProductItem(this.serviceItem.productItem.id)
            )
            .subscribe(([itemAttributes,contactRelations,childrenMultiplicity,productItemAttributes]) => {
                this.itemAttributes = itemAttributes;
                //console.log(productItemAttributes);
                this.serviceItemFormBuilder.setProductitemAttributes(productItemAttributes);
                this.serviceItemFormBuilder.setServiceItem(this.serviceItem);
                this.serviceItemFormBuilder.setServiceItemAttributes(this.itemAttributes);
                this.serviceItemFormBuilder.setServiceItemContactRelations(contactRelations)
                //Get Form-Components
                forkJoin(
                    this.serviceItemFormBuilder.getFormModelForServiceObject(),
                    this.serviceItemFormBuilder.getFormModelForMultiplicity(childrenMultiplicity),
                    this.serviceItemFormBuilder.getFormModelForAttributes(),
                    this.serviceItemFormBuilder.getFormModelForServiceContacts()
                )
                //.pipe(catchError(error => of(error)))
                .subscribe(([serviceModel,mpModel,attrModel, contactModel]) => {

                    this.formModel = [].concat(serviceModel,mpModel,attrModel,contactModel);
                    this.formGroup = this.formService.createFormGroup(this.formModel);
                    this.getFormValidationErrors();

                },
                err => {
                    console.log(err);
                    this.alertService.danger('Eingabemaske konnte nicht erstellt werden');
                });

            },
            err => {
                    console.log("Error getting ItemAttributes & Contact-Relations",err);
                    //this.messageService.add(err)
            });


        },
        err => {
           console.log(err);
           //this.messageService.add(err)
        });



    }

    getFormValidationErrors() {
    Object.keys(this.formGroup.controls).forEach(key => {

      const controlErrors: ValidationErrors = this.formGroup.get(key).errors;
      if (controlErrors != null) {
            Object.keys(controlErrors).forEach(keyError => {
              this.logger.warn('Form-Element with validation-error:' + key + ', violated validation: ' + keyError + ', error value: ', controlErrors[keyError])
              //console.log('Key control: ' + key + ', keyError: ' + keyError + ', err value: ', controlErrors[keyError]);
            });
          }
      });
    }

    updateServiceItem(){
        //validierungen ?
       //console.log(this.serviceItem.displayName);
       let modifiedItem = this.serviceItemFormBuilder.getUpdatedServiceItemFromModel(this.formModel);
       modifiedItem.displayName = this.serviceItem.displayName;
       let modifiedAttributes = this.serviceItemFormBuilder.getUpdatedAttributesFromModel(this.formModel);
       this.servicItemService.modifyServiceItem(modifiedItem,modifiedAttributes).subscribe(res => {
           //console.log("Contact-Relation", this.formGroup.value.serviceitem_contactRelation);
           this.serviceItem=res;
           this.alertService.success('Service-Element wurde aktualisiert');

           //geht nur wenn kundenzuordnung erfolgt
           //im test sowieso nicht
          if ((res.status!="TEST") && (res.partner != null)){
            this.servicItemService.replaceContactRelations(this.serviceItem.id,this.formGroup.value.serviceitem_contactRelation).subscribe(res => {
              //this.itemContactRelations = res;
              //this.alertService.success('Ansprechpartner wurden aktualisiert');
              }, err => {console.error(err);}
            );
          }


          }, err => {
              console.error(err);
              this.alertService.warning('Service-Element konnte nicht aktualisiert werden');
          }
        );

        /*
        forkJoin(
            this.servicItemService.updateServiceItem(this.serviceItemFormBuilder.getUpdatedServiceItemFromModel(this.formModel)),
            this.servicItemService.updateServiceItemAttributes(this.serviceItem.id,this.serviceItemFormBuilder.getUpdatedAttributesFromModel(this.formModel))
        ).subscribe(([svcItem1,svcItem2]) => {
                //notify
                this.servicItemService.reloadBS(svcItem1.owningBusinessServiceId);
                this.servicItemService.notifySvcItemUpdate(svcItem1.id);


            },
            err => {
                    console.log(err);
                    this.messageService.add(err)
            }
        );*/

    }


    getPriceInfo(){

      this.scriptService.getDataSheet(this.serviceItem.id).subscribe((blob) => {
        var url= window.URL.createObjectURL(blob);
        window.open(url);

      },err => {

        console.error(err);
        this.alertService.warning('Preisblatt konnte nicht erstellt werden');

      });


    }

    updateServiceItemSimpleMultiplicity(childAssocName:string,multiplicity:number,oldMultiplicity:number){

        this.servicItemService.modifyServiceItemMultiplicity(this.serviceItem.id,childAssocName,multiplicity)
        .subscribe(res => {
            this.servicItemService.reloadBS(this.serviceItem.owningBusinessServiceId);
            this.servicItemService.notifySvcItemUpdate(this.serviceItem.id);
        },err => {
            console.warn("Error while updating Service-Multiplicity: ",err);
            //revert switch
        })
    }

    onBlur($event) {
        //console.log(`Material blur event on: ${$event.model.id}: `, $event);
    }

    onChange($event) {
        //console.log(`Material change event on: ${$event.model.id}: `, $event);
        if (t($event,'model.additional.multiplicitySwitch').safeBoolean) {
            //console.log("MP switch ",$event.control.value);
            if($event.control.value){
              this.updateServiceItemSimpleMultiplicity($event.model.id,1,0);
            } else {
              this.updateServiceItemSimpleMultiplicity($event.model.id,0,1);
            }
            //this.updateServiceItemSimpleMultiplicity()
        }
        if(t($event,'model.id').safeString==="serviceitem_serviceTerms"){
            //console.log("ST switch ",$event.control.value);
            this.updateServiceItem();
        }
    }

    onFocus($event) {
        //console.log(`Material focus event on: ${$event.model.id}: `, $event);
    }

    onMatEvent($event) {
        //console.log(`Material ${$event.type} event on: ${$event.model.id}: `, $event);
    }



}
