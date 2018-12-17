import { Component, OnInit,Input, OnChanges, SimpleChange } from '@angular/core';
import { ServiceItemDto,AttributeDto } from '../../api/models';
import {ServiceItemService} from '../../services/service-item.service';

@Component({
  selector: 'app-svcitem-config',
  templateUrl: './svcitem-config.component.html',
  styleUrls: ['./svcitem-config.component.css']
})
export class SvcitemConfigComponent implements OnInit,OnChanges {

  @Input() svcItem:ServiceItemDto;
  private itemAttributes:Array<AttributeDto>;
  private svcItemForm={};
  
  constructor(
    private svcItemService:ServiceItemService
  ) { }

  ngOnInit() {
      //console.log('in item',this.svcItem);
  }
  
  ngOnChanges() {
      //getItemAttributes
    console.log('change in item',this.svcItem);
    this.getAttributes();
    this.svcItemService.reloadBS(12);
    this.getForm();
  } 
  
  getAttributes(){
      this.svcItemService.getItemAttributes(this.svcItem.id).subscribe(res => {
          this.itemAttributes = res;
          console.log(res);
        });
      
  }
  
  getForm(){
      //http://apis.witcom-dev.services/forms/testform
      this.svcItemForm={
    "title": "My Test Form",
    "components": [
        {
            "type": "textfield",
            "input": true,
            "tableView": true,
            "inputType": "text",
            "inputMask": "",
            "label": "First Name",
            "key": "firstName",
            "placeholder": "Enter your first name",
            "prefix": "",
            "suffix": "",
            "multiple": false,
            "defaultValue": "",
            "protected": false,
            "unique": false,
            "persistent": true,
            "validate": {
                "required": true,
                "minLength": 2,
                "maxLength": 10,
                "pattern": "",
                "custom": "",
                "customPrivate": false
            },
            "conditional": {
                "show": "",
                "when": null,
                "eq": ""
            }
        },
        {
            "type": "textfield",
            "input": true,
            "tableView": true,
            "inputType": "text",
            "inputMask": "",
            "label": "Last Name",
            "key": "lastName",
            "placeholder": "Enter your last name",
            "prefix": "",
            "suffix": "",
            "multiple": false,
            "defaultValue": "",
            "protected": false,
            "unique": false,
            "persistent": true,
            "validate": {
                "required": true,
                "minLength": 2,
                "maxLength": 10,
                "pattern": "",
                "custom": "",
                "customPrivate": false
            },
            "conditional": {
                "show": "",
                "when": null,
                "eq": ""
            }
        },
        {
            "input": true,
            "label": "Abschicken",
            "tableView": false,
            "key": "submit",
            "size": "md",
            "leftIcon": "",
            "rightIcon": "",
            "block": false,
            "action": "submit",
            "disableOnInvalid": true,
            "theme": "primary",
            "type": "button"
        }
    ]
};
      
  }
  
  getItemFriendlyName():string{
     if (this.svcItem.roleDisplayName !== null){
         return this.svcItem.roleDisplayName;
     } 
     return this.svcItem.displayName;
  }

}
