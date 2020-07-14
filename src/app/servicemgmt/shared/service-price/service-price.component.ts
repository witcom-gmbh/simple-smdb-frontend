import { Component, OnInit,Input } from '@angular/core';
import { ServiceItemDto,AttributeDto,MoneyItemDto } from '../../../api/models';
import {ServiceItemService,ServiceTerm} from '../../../services/services';
import t from 'typy';
import { NGXLogger } from 'ngx-logger';
import { AlertService } from 'ngx-alerts';
import {Subscription} from 'rxjs';
import { SmdbConfig } from '../smdb-config';

@Component({
  selector: 'service-price',
  templateUrl: './service-price.component.html',
  styleUrls: ['./service-price.component.css']
})
export class ServicePriceComponent implements OnInit {

    prices:Array<MoneyItemDto>=null;
    @Input() serviceItemId:number;
    serviceItem:ServiceItemDto=null;
    private subscription:Subscription;
    private updating:boolean=false;

  constructor(
        private logger: NGXLogger,
        private alertService: AlertService,
        private servicItemService:ServiceItemService,
  ) { }

  ngOnInit() {

      this.subscription = this.servicItemService.updatedBS$.subscribe(item => {
           this.logger.debug("Service has been updated ",item);
           this.getServiceItem();
      });
      if(t(this.serviceItemId).isNumber){
        this.getServiceItem();
      }


  }

  /**
   * Gets all prices that are avialable for a service. A price is available if the AccountingType is selected in the products
   * CustomProperty 'availableAccountingTypes'
   *
   *
   */
  private getPrice(){
      let availableAccountingTypes:Array<String> = this.servicItemService.getAvailableAccountingTypes(this.serviceItem);
      //get prices
      this.servicItemService.getItemPrices(this.serviceItemId).subscribe(
      prices => {
          this.prices = prices.filter(p => availableAccountingTypes.find(a=> a===p.accountingType.name));
          this.updating=false;
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
