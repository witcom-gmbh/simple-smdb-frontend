import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {Subscription} from 'rxjs';
import { Location } from '@angular/common';
import {ServiceItemService} from '../../services/service-item.service';
import { AlertService } from 'ngx-alerts';

//import { ServiceRetrievalV2Service } from '../../api/services';
import { ServiceItemDto,ServiceDataSelectorDto,ServiceItemTreeDto } from '../../api/models';

@Component({
  selector: 'app-service-config',
  templateUrl: './service-config.component.html',
  styleUrls: ['./service-config.component.css']
})
export class ServiceConfigComponent implements OnInit {

    private svcItemId:number;
    private serviceId:number;
    private svcItem:ServiceItemDto;
    public svcItemTree:ServiceItemTreeDto;
    private selectedSvcItem:ServiceItemDto;
    private subscription:Subscription;

  constructor(
    //private svcRetrieval:ServiceRetrievalV2Service,
    private svcItemService:ServiceItemService,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private location: Location
  ) { }

  ngOnInit() {
      this.getServiceItem();
      this.subscription = this.svcItemService.updatedBS$
       .subscribe(item => {
           console.log(item);
           this.reloadTree();
           });
  }

  getServiceItem():void{
     const id = +this.route.snapshot.paramMap.get('id');
     console.log('get service with id {}',id);
     this.svcItemId=id;
     this.serviceId=id;
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
      this.svcItemId=this.svcItemService.getItemIdByObject(svcItem);

      this.svcItemService.getItemByObject(svcItem).subscribe(
        response => {
            this.selectedSvcItem=response;
            //console.log(response);
        },
        err => {
           this.alertService.danger('Service-Element konnte nicht geladen werden');
        });
      /*
      this.svcItemService.getItemById(svcItem.id).subscribe(response => {
         console.log(response);
      });*/


      //this.selectedSvcItem=svcItem;

  }

  reloadTree(){
      this.svcItemService.getTreeById(this.svcItemId).subscribe(res =>
         {
             this.svcItemTree=res;
             //console.log(res)
         })


  }

  ngOnDestroy() {
    // prevent memory leak when component is destroyed
    this.subscription.unsubscribe();
  }

}
