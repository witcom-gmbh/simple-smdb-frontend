import { Component, OnInit,Input } from '@angular/core';

import t from 'typy';
import { Router } from "@angular/router";
import { NGXLogger } from 'ngx-logger';
import { AlertService } from 'ngx-alerts';
import {Subscription} from 'rxjs';
import { Observable,throwError,of  } from 'rxjs';
import { FormControl } from '@angular/forms';
import {SplTranslatePipe} from '../shared/shared.module';
import {ProductSearchService,ServiceItemService,ServiceManagementService,ProductService} from '../services/services';
import {
    ProductItemDto, ServiceDto, NamedProductCatalogDto, MoneyItemDto,
} from '../api/models';


@Component({
  selector: 'product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent implements OnInit {

  @Input() product:ProductItemDto;
  sla:string;
  pricePreview:boolean=false;
  previewPrice:MoneyItemDto=null;

  constructor(
    private logger: NGXLogger,
        private alertService: AlertService,
        private serviceMgmt:ServiceManagementService,
        private productSearchService: ProductSearchService,
        private productService: ProductService,
        private svcItemService: ServiceItemService,
        private router: Router,
  ) { }

  ngOnInit() {
    //this.logger.debug("got product",this.product);

    //preis schnickschnack


    let previewAccountingType=null;
    //Folgende Verrechnungtypen koennen in der Preisvorschau angezeigt werden
    let knownAccountingTypes=['acctTypeMonthlyGeneric','jaehrlich'];
    let prodAccountingTypesProp=this.productService.getProductItemCustomPropertyByName(this.product,"availableAccountingTypes");

    //sind preise definiert ?
    if(t(prodAccountingTypesProp,"multiValue.values").isArray){
      let prodAccountingTypes = prodAccountingTypesProp.multiValue.values;
      //sind diese preise auch in der vorschau anzeigbar ?
      let filtered = prodAccountingTypes.filter(
        function (e) {
          return this.indexOf(e) >= 0;
        },
        knownAccountingTypes
      );
      if(filtered.length>0){
        //nur ein verrechnungstyp im preview
        previewAccountingType=filtered[0];
        this.pricePreview=true;
      }
    }

    if (this.pricePreview){
      //lade default-preise fuer produkt
      this.productService.getDefaultPricingForProduct(this.product.id).subscribe(pricing => {
        //aus allen verrechnungstypen den preview-typ filter
        this.previewPrice = pricing.find(p => p.accountingTypeName==previewAccountingType)
      },err=>{
        this.alertService.warning("Kann Preise fuer "+productId+" nicht ermitteln");
      })
    }



    //let slaProp=this.product.customProperties.properties.find(it => it.name=="slaVerfuegbarkeit");


    //get sla
    this.sla="NICHT DEFINIERT"
    let slaProp=this.product.customProperties.properties.find(it => it.name=="slaVerfuegbarkeit");
    if (!t(slaProp).isNullOrUndefined){
      this.sla=slaProp.valueFormatted;
    }

    let productId=this.product.id;



    //this.logger.debug(sla);


  }

  createInstance(){
    this.logger.info("ab gehts");

    this.serviceMgmt.instantiateBusinessServiceFromProdukt(this.product.id,false).subscribe(
      response => {
          //Todo aus dem Service-Tree das Service-Element filtern, das aus dem Produkt instanziiert wurde - hier ist es immer das erste
          //console.log(response.serviceGroups[0].services[0].service.id);

          let serviceItem:ServiceDto = response.serviceGroups[0].services[0].service;
          //update service item
          //serviceItem.description = "this is a test";
          //serviceItem.customProperties.properties[3].value="12345";

          this.svcItemService.updateServiceItem(serviceItem).subscribe(updateRes => {
            let serviceId = updateRes.id;
            this.router.navigate(['/service-config', serviceId]).then( (e) => {
              if (e) {
                console.log("Navigation is successful!");
              } else {
                console.log("Navigation has failed!");
              }
            });
          },err => {
            console.log(err);
            this.alertService.danger('Service konnte nicht aktualisiert werden');
          });
      },
        err => {
           console.log(err);
           this.alertService.danger('Service konnte nicht angelegt werden');

        });

  }

}
