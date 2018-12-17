import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {Subscription} from 'rxjs'; 
import { Location } from '@angular/common';
import {ServiceItemService} from '../../services/service-item.service';
import { MessageService } from '../../services/message.service';

//import { ServiceRetrievalV2Service } from '../../api/services';
import { ServiceItemDto,ServiceDataSelectorDto,ServiceItemTreeDto } from '../../api/models';

@Component({
  selector: 'app-service-config',
  templateUrl: './service-config.component.html',
  styleUrls: ['./service-config.component.css']
})
export class ServiceConfigComponent implements OnInit {
    
    private svcItem:ServiceItemDto;
    private svcItemTree:ServiceItemTreeDto;
    private selectedSvcItem:ServiceItemDto;
    private subscription:Subscription;

  constructor(
    //private svcRetrieval:ServiceRetrievalV2Service,
    private svcItemService:ServiceItemService,
    private messageService:MessageService,
    private route: ActivatedRoute,
    private location: Location
  ) { }

  ngOnInit() {
      this.getServiceItem();
      this.subscription = this.svcItemService.updatedBS$
       .subscribe(item => {console.log(item)});
  }

  getServiceItem():void{
     const id = +this.route.snapshot.paramMap.get('id');
     console.log('get service with id {}',id);
     
     this.svcItemService.getItemById(id).subscribe(response => {
       //console.log(response)
       this.svcItem = response;
       this.selectedSvcItem=response;
       //get service tree
       this.svcItemService.getTreeById(id).subscribe(res =>
         {
             this.svcItemTree=res;
             //console.log(res)
         });
         
     });
     
  }
  
  onSelectServiceItem(svcItem:any):void{
      console.log(svcItem._type); 
      this.svcItemService.getItemByObject(svcItem).subscribe(
        response => {
            this.selectedSvcItem=response;
            //console.log(response); 
        },
        err => {
           console.log(err);
           this.messageService.add(err)
        });
      /*
      this.svcItemService.getItemById(svcItem.id).subscribe(response => {
         console.log(response); 
      });*/

      
      //this.selectedSvcItem=svcItem;
      
  }
  
  ngOnDestroy() {
    // prevent memory leak when component is destroyed
    this.subscription.unsubscribe();
  }

}
