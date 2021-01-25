import { Component, OnInit,Input } from '@angular/core';

import t from 'typy';
import { Router } from "@angular/router";
import { NGXLogger } from 'ngx-logger';
import { AlertService } from 'ngx-alerts';
import {Subscription} from 'rxjs';
import { Observable,throwError,of  } from 'rxjs';
import { FormControl } from '@angular/forms';
import {SplTranslatePipe} from '../shared/shared.module';
import {ProductSearchService,ServiceItemService,ServiceManagementService,ProductService, ServiceAccessAvailabilityCheckService} from '../services/services';
import {
    ProductItemDto, ServiceDto, NamedProductCatalogDto, MoneyItemDto, AttributeDto,
} from '../api/models';
import { TAXONOMY_PREFIX_AVAILABILITY_REQUIREMENTS } from '../shared/constants.module';
import { ServiceAccessObject } from '../models';

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

  private availabilitySubscription:Subscription;
  serviceAccessRequirements:Array<ServiceAccessObject>=[];

  constructor(
    private logger: NGXLogger,
        private alertService: AlertService,
        private serviceMgmt:ServiceManagementService,
        private productSearchService: ProductSearchService,
        private productService: ProductService,
        private svcItemService: ServiceItemService,
        private router: Router,
        private saCheckService: ServiceAccessAvailabilityCheckService,
        private serviceItemSvc: ServiceItemService
  ) { }

  ngOnInit() {
    this.logger.debug("got product",this.product);

    //aenderungen verfuegbarkeitsabfrage
    this.availabilitySubscription=this.saCheckService.UpdatedServiceAccessAvailability.subscribe(res=>{
      this.serviceAccessRequirements=res;
      //console.log(res);
    });


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


    //get sla
    this.sla="NICHT DEFINIERT"
    let slaProp=this.product.customProperties.properties.find(it => it.name=="slaVerfuegbarkeit");
    if (!t(slaProp).isNullOrUndefined){
      this.sla=slaProp.valueFormatted;
    }

    let productId=this.product.id;



    //this.logger.debug(sla);


  }

  isProductAvailable():boolean{

    //Produkt verfuegbar ?
    let requiredServiceAccess:Array<string>=[];
    let limitedAvailability=this.product.customProperties.properties.find(it => it.name=="limitedAvailability");
    if (!t(limitedAvailability).isTrue){
      //Requirements
      let availabilityRequirementsProp=this.product.customProperties.properties.find(it => it.name=="availabilityRequirements");
      if (!t(availabilityRequirementsProp).isNullOrUndefined){
        if(!t(availabilityRequirementsProp.multiValue.values).isNullOrUndefined){
          //let values = availabilityRequirementsProp.multiValue.values;
          let availableSAs=this.serviceAccessRequirements.map(x=>x.serviceAccessSubType);//this.saCheckService.getAvailableServiceAccessObjects().map(x=>x.serviceAccessSubType);
          //console.log("available SA",availableSAs);
          requiredServiceAccess = availabilityRequirementsProp.multiValue.values.map(x => x.substr(TAXONOMY_PREFIX_AVAILABILITY_REQUIREMENTS.length))
          //console.log("required SA",requiredServiceAccess);
          let isFound = requiredServiceAccess.some( ai => availableSAs.includes(ai));

          if (isFound){

            return true;
          }
        }
      }
      //dev only
      return true;
    }


    return true;

  }

  createInstance(){
    this.logger.info("ab gehts");

    //TO - REDUCE COMPLEXITY

    this.productService.getAttributeDefByProductItem(this.product.id).subscribe(prodAttr => {
      console.log(prodAttr);
      //get attribute that defines service-Access & location from product.
      //those have to update after instantiation

      var saProcessor = "/attributeProcessor/serviceAccess"; // what to look for
      let locationClassifier="aEnde";
      let matches = [];
      //
      prodAttr.forEach(function(e) {
        //console.log(e.attributeDef.customProperties.properties);
        //console.log(e.attributeDef.customProperties.properties.filter(p => p.value === needle));
        if (e.attributeDef.customProperties.properties.filter(p => p.value === saProcessor).length==1){
          //Service-Access A oder B-Ende ?
          if (e.attributeDef.customProperties.properties.filter(p => p.value === locationClassifier).length==1)
          {
            //Service-Access-Subtypen
            //Todo
            matches.push(e);
          }
        }
      });
      if(matches.length!=1){
        //throw error
      }
      let saAEndeAttributeDef = matches[0];

      var locationProcessor = "/attributeProcessor/lookup/location"; // what to look for
      //let locationClassifier="aEnde";
      matches = [];
      prodAttr.forEach(function(e) {
        if (e.attributeDef.customProperties.properties.filter(p => p.value === locationProcessor).length==1){
          //Service-Access A oder B-Ende ?
          if (e.attributeDef.customProperties.properties.filter(p => p.value === locationClassifier).length==1)
          {
            matches.push(e);
          }
        }
      });
      if(matches.length!=1){
        //throw error
      }

      let locationAEndeAttributeDef = matches[0];

      console.log(saAEndeAttributeDef);
      console.log(locationAEndeAttributeDef);


      this.serviceMgmt.instantiateBusinessServiceFromProdukt(this.product.id,false).subscribe(
      response => {
          //Todo aus dem Service-Tree das Service-Element filtern, das aus dem Produkt instanziiert wurde - hier ist es immer das erste
          //console.log(response.serviceGroups[0].services[0].service);

          let serviceItem:ServiceDto = response.serviceGroups[0].services[0].service;
          //update service item
          //serviceItem.description = "this is a test";
          //serviceItem.customProperties.properties[3].value="12345";
          console.log(serviceItem);
          let attrsToUpdate=[];

          this.svcItemService.getItemAttributes(serviceItem.id).subscribe(svcAttrs => {
            //service-access a-ende
            let saAEndeAttributes = svcAttrs.filter(attr => attr.name === saAEndeAttributeDef.attributeDef.name);
            if (saAEndeAttributes.length==1){
              let attr:any = saAEndeAttributes[0];
              //get service-access
              attr.value='{attrtest:"value"}';
              //attr.v
              attrsToUpdate.push(attr);
            }
            //location a-ende


            console.log("attr to update",attrsToUpdate);
            this.svcItemService.modifyServiceItem(serviceItem,attrsToUpdate).subscribe(updateRes => {
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
          }

      )},
        err => {
           console.log(err);
           this.alertService.danger('Service konnte nicht angelegt werden');

        });



  })};


}
