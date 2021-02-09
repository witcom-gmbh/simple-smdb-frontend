import { Component, OnInit,Input } from '@angular/core';
import { ServiceItemDto,AttributeDto,MoneyItemDto } from '../../../api/models';
import {ServiceItemService,ServiceTerm} from '../../../services/services';
import t from 'typy';
import { NGXLogger } from 'ngx-logger';
import { AlertService } from 'ngx-alerts';
import {Subscription} from 'rxjs';
import { SmdbConfig } from '../smdb-config';
import { ChangePrice, UsagePrice } from '../../../models';

@Component({
  selector: 'service-price',
  templateUrl: './service-price.component.html',
  styleUrls: ['./service-price.component.css']
})
export class ServicePriceComponent implements OnInit {

    prices:Array<MoneyItemDto>=null;
    changePrices:Array<ChangePrice>=[];
    usagePrices:Array<UsagePrice>=[];
    @Input() serviceItemId:number;
    serviceItem:ServiceItemDto=null;
    private subscription:Subscription;
    private serviceSubscription:Subscription;
    private updating:boolean=false;

  constructor(
        private logger: NGXLogger,
        private alertService: AlertService,
        private servicItemService:ServiceItemService,
  ) { }

  ngOnInit() {

      this.subscription = this.servicItemService.updatedBS$.subscribe(item => {
           this.logger.debug("Business-Service has been updated ",item);
           //this.getServiceItem();
      });

      this.serviceSubscription = this.servicItemService.updatedSvcItem$.subscribe(item => {
          this.logger.debug("Service has been refreshed",item);
          if(item!=null){
             this.serviceItem=item;
             this.getPrice();
          }
      });


      if(t(this.serviceItemId).isNumber){
        //this.getServiceItem();
      }


  }

  /**
   * Gets all prices that are avialable for a service. A price is available if the AccountingType is selected in the products
   * CustomProperty 'availableAccountingTypes'
   *
   *
   */
  private getPrice(){
    console.log(this.serviceItem);
    if (this.serviceItem == null){
      return;
    }
      this.updating=true;
      let availableAccountingTypes:Array<String> = this.servicItemService.getAvailableAccountingTypes(this.serviceItem);
      //get prices
      this.servicItemService.getItemPrices(this.serviceItemId).subscribe(
      prices => {
          this.prices = prices.filter(p => availableAccountingTypes.find(a=> a===p.accountingType.name));
          this.updating=false;

      },err => {
            this.alertService.danger("Preise konnten nicht geladen werden");
      });

      this.servicItemService.getChangePricesForService(this.serviceItem).subscribe(changePrices => {
        console.log(changePrices);
        this.changePrices = changePrices;
      },err => {
          //console.log(err);
          this.alertService.danger("Change-Preise konnten nicht geladen werden");
      });

      this.servicItemService.getUsageBasedPricesForService(this.serviceItem).subscribe(usagePrices => {
        console.log(usagePrices);
        this.usagePrices = usagePrices;
      },err => {
          console.log(err);
          this.alertService.danger("Nutzungs-Preise konnten nicht geladen werden");
      });



  }

  private getServiceItem(){
      this.updating=true;
      this.servicItemService.getItemById(this.serviceItemId).subscribe(
        response => {
            this.serviceItem=response;
            this.getPrice();
        },err => {
            this.alertService.danger("Service konnte nicht geladen werden");

        });
  }

  orderBy(prop: string) {
  return this.prices.sort((a, b) => a[prop] > b[prop] ? 1 : a[prop] === b[prop] ? 0 : -1);
  }

}
