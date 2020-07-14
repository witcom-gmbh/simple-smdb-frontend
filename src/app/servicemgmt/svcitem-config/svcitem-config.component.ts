import { Component, OnInit,Input, OnChanges, SimpleChange } from '@angular/core';
import { ServiceItemDto,AttributeDto } from '../../api/models';
import {ServiceItemService} from '../../services/service-item.service';
import { FormBuilderService } from '../../services/form-builder.service';


/**
 * OBSOLETE
 *
 */
@Component({
  selector: 'app-svcitem-config',
  templateUrl: './svcitem-config.component.html',
  styleUrls: ['./svcitem-config.component.css']
})
export class SvcitemConfigComponent implements OnInit,OnChanges {

  @Input() svcItem:ServiceItemDto;
  private itemAttributes:Array<AttributeDto>;
  public svcItemForm={};
  public attributeSubmission={'data':{}};
  private formBuilderService:FormBuilderService

  constructor(
    private svcItemService:ServiceItemService,
    //private formBuilderService:FormBuilderService
  ) {
     this.formBuilderService = new FormBuilderService();
  }

  ngOnInit() {
      //console.log('in item',this.svcItem);
  }

  ngOnChanges() {
      //getItemAttributes
    console.log('change in item',this.svcItem);
    this.getAttributes();
    //this.svcItemService.reloadBS(12);
    //this.getForm();
  }

  getAttributes(){
      this.svcItemService.getItemAttributes(this.svcItem.id).subscribe(res => {
          this.itemAttributes = res;
          console.log(res);

          /*
          this.formBuilderService.testObservable().subscribe(res => {
            console.log("dummy observable",res);
          },
          err => {console.error('my error')});
          */


          let formSpec = this.formBuilderService.buildServiceItemAttributeForm(this.itemAttributes);
          this.svcItemForm=formSpec.formDefinition;
          this.attributeSubmission=formSpec.submission;
        });

  }

  updateSvcItem(submission:any):void{
      console.log(submission.data);
      this.svcItemService.modifyServiceItem(this.svcItem,
      this.formBuilderService.buildModifiedAttributesFromFormData(this.itemAttributes,submission.data)).subscribe(res => {
          console.log("Update ok");
          }, err => {console.error(err);}
      );

  }

  onSvcItemUpdateFormEvent(submission: any) {
    if (submission.type!==null && submission.type!==undefined){
      switch(submission.type) {
        case "testEvent":
            //this.onTest(submission);
            break;
        case "updateSvcItem":
            this.updateSvcItem(submission);
            break;
        default:
            console.log('Unknown event ', submission);
      }
    }
  }

  /*
  getItemFriendlyName():string{
     if (this.svcItem.roleDisplayName !== null){
         return this.svcItem.roleDisplayName;
     }
     return this.svcItem.displayName;
  }*/

}
