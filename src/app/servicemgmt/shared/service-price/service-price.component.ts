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

  private getPrice(){
      let serviceTerm:ServiceTerm = null;
      if (this.servicItemService.isServicePricingTermBased(this.serviceItem)){
          serviceTerm = this.servicItemService.getServiceTerms(this.serviceItem);
          if (serviceTerm === null){
              //Standard-Laufzeit
              serviceTerm = this.servicItemService.getDefaultServiceTermForService(this.serviceItem);

          }
          if (serviceTerm===null){
              this.alertService.warning('Service-Preisberechnung nicht möglich');
              return;
          }
      } else {

          serviceTerm = {name:"",value:"FIXED"};
      }

      //get accounting-types for serviceTerms
      //console.log("AllowedAccountingTypeMapping ",SmdbConfig.accountingTypeMapping.find(m => m.serviceTerms === serviceTerm.value));
      let allowedAccoutingsTypeMapping = SmdbConfig.accountingTypeMapping.find(m => m.serviceTerms === serviceTerm.value);
      if (t(allowedAccoutingsTypeMapping,'accountingTypes').isEmptyArray){
          this.logger.warn("No Accountingtypes found for Service-Terms ",serviceTerm.value);
          this.alertService.warning('Service-Preisberechnung nicht möglich');
          return;
      }
      let allowedAccoutingsTypes = allowedAccoutingsTypeMapping.accountingTypes;
      //get prices
      this.servicItemService.getItemPrices(this.serviceItemId).subscribe(
      prices => {
          //this.logger.debug(prices.accountingType.name);
          this.prices = prices.filter(p => allowedAccoutingsTypes.find(a=>a.name===p.accountingType.name));
          this.updating=false;
          //console.log(filteredPrices);
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
