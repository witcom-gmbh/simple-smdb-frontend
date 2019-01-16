import { Component, OnInit } from '@angular/core';
import {FormControl,FormBuilder,FormGroup,Validators} from '@angular/forms';
import { DynamicFormService } from "@ng-dynamic-forms/core";
import {
    DynamicFormModel,
    DynamicCheckboxModel,
    DynamicInputModel,
    DynamicRadioGroupModel
} from "@ng-dynamic-forms/core";
import {DynamicDslAbfrageControlModel,DSLAbfrageProdukt} from '../../shared/dfc/dfc';


@Component({
  selector: 'app-form-test',
  templateUrl: './form-test.component.html',
  styleUrls: ['./form-test.component.css']
})
export class FormTestComponent implements OnInit {
    
    formGroup: FormGroup;
    formControl = new FormControl('', [
        Validators.required,
    ]);
    
    formModel: DynamicFormModel = [

    new DynamicInputModel({

        id: "sampleInput",
        label: "Sample Input",
        maxLength: 42,
        placeholder: "Sample input"
    })
    ,
    new DynamicDslAbfrageControlModel({
        id: "bsaAbfrage",
        selectableBSAProducts : [{
	"materialNummer": "89800055",
	"produktoption": "bsa100_40",
	"produktoptionName": "100/40 MBit/s"
}, {
	"materialNummer": "89743558",
	"produktoption": "bsa16_1",
	"produktoptionName": "16/1 MBit/s"
}, {
	"materialNummer": "89742311",
	"produktoption": "bsa25_5",
	"produktoptionName": "25/5 MBit/s"
}, {
	"materialNummer": "89742312",
	"produktoption": "bsa50_10",
	"produktoptionName": "50/10 MBit/s"
}, {
	"materialNummer": "89896963",
	"produktoption": "bsa2550",
	"produktoptionName": "250 MBit/s"
}
]
        
    }
    
    )
    
    ];
    
    
    bsaAbfrage:DynamicDslAbfrageControlModel = new DynamicDslAbfrageControlModel({
        id: "bsaAbfrage",
        selectableBSAProducts : [{
	"materialNummer": "89800055",
	"produktoption": "bsa100_40",
	"produktoptionName": "100/40 MBit/s"
}, {
	"materialNummer": "89743558",
	"produktoption": "bsa16_1",
	"produktoptionName": "16/1 MBit/s"
}, {
	"materialNummer": "89742311",
	"produktoption": "bsa25_5",
	"produktoptionName": "25/5 MBit/s"
}]
        
    }
    
    );
    
    //formModel.push(bsaAbfrage);
    
    selectableBsaProducts:DSLAbfrageProdukt[] = [{
	"materialNummer": "89800055",
	"produktoption": "bsa100_40",
	"produktoptionName": "100/40 MBit/s"
}, {
	"materialNummer": "89743558",
	"produktoption": "bsa16_1",
	"produktoptionName": "16/1 MBit/s"
}, {
	"materialNummer": "89742311",
	"produktoption": "bsa25_5",
	"produktoptionName": "25/5 MBit/s"
}]; 
    
    itemId:number=10230092;
    requiredContactRoles:string[] = ['contactCommercial'];

    constructor(
    private fb: FormBuilder,private formService: DynamicFormService
    ) { }

    ngOnInit() {
        
        this.formGroup = this.formService.createFormGroup(this.formModel); 
        
        console.log(this.formGroup);
    
    }

}
