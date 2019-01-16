import { Component, OnInit, OnChanges, SimpleChange,Input } from '@angular/core';
import { ContactRelationDto,ServiceItemDto,AttributeDto,ContactTypeDto,PartnerDto,ContactDto } from '../../../api/models';
import {MatChipsModule} from '@angular/material/chips';
import {SplTranslatePipe} from '../../../shared/shared.module'

export interface ContactTypeChip {
    name: string;
    displayName:any;
    color: string;
    
}

@Component({
  selector: 'required-contact-roles',
  templateUrl: './required-contact-roles.component.html',
  styleUrls: ['./required-contact-roles.component.css']
})
export class RequiredContactRolesComponent implements OnInit {
    
    @Input() requiredContactTypes: ContactTypeDto[];
    @Input() selectedContactRelations:ContactRelationDto[];
    
    private requiredContactTypeChips: ContactTypeChip[] = [];

    constructor(
        
    ) { }

    ngOnInit() {
    }
  
    ngOnChanges() {
        var selectedTypes:string[];
        if ( this.selectedContactRelations !== undefined){
            selectedTypes = [].concat.apply([], this.selectedContactRelations.map(rel => rel.contactTypes)).map(contactType=>contactType.name).reduce(function(a,b){if(a.indexOf(b)<0)a.push(b);return a;},[]);
            //console.log(selectedTypes);
            this.requiredContactTypeChips = [];
            for (let role of this.requiredContactTypes) {
                if (selectedTypes.find(t => t==role.name)){
                    this.requiredContactTypeChips.push({name:role.name,displayName:role.displayName,color:'primary'});    
                } else {
                    this.requiredContactTypeChips.push({name:role.name,displayName:role.displayName,color:'warn'});
                }
            }
        }
    }


}
