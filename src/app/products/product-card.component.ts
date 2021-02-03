import { Component, OnInit,Input } from '@angular/core';

import t from 'typy';
import { Router } from "@angular/router";
import { NGXLogger } from 'ngx-logger';
import { AlertService } from 'ngx-alerts';
import {Subscription} from 'rxjs';
import {map} from 'rxjs/operators';
import { Observable,throwError,of  } from 'rxjs';
import { FormControl } from '@angular/forms';
import {SplTranslatePipe} from '../shared/shared.module';
import {ProductSearchService,ServiceItemService,ServiceManagementService,ProductService, ServiceAccessAvailabilityCheckService} from '../services/services';
import {
    ProductItemDto, ServiceDto, NamedProductCatalogDto, MoneyItemDto, AttributeDto, AttributeDefAssociationDto,
} from '../api/models';
import { TAXONOMY_PREFIX_AVAILABILITY_REQUIREMENTS } from '../shared/constants.module';
import { ServiceAccessObject, LocationClassifier, ServiceLocationObject, ServiceLocationSource } from '../models';
import { NominatimAddress } from '../shared/dfc/dfc';

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
  private availableServiceAccessObjects:Array<ServiceAccessObject>=[];

  private availabilityAdressSubscription:Subscription;
  private selectedLocation:ServiceLocationObject=<ServiceLocationObject>{};


  private requiredServiceAccess:Array<string>=[];

  private saAEndeAttributeDef:AttributeDefAssociationDto;
  private locationAEndeAttributeDef:AttributeDefAssociationDto;

  private loadingDone:boolean=false;




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
      this.availableServiceAccessObjects=res;

    });

    this.availabilityAdressSubscription=this.saCheckService.UpdatedSelectedAdress.subscribe(res=>{
      //console.log(res);
      //map address to ServiceLocationObject
      if (res == null){
        return;
      }

      this.selectedLocation=<ServiceLocationObject>{};
      this.selectedLocation.source=ServiceLocationSource.MANUAL;
      this.selectedLocation.addrCity=res.city;
      this.selectedLocation.addrStreet=res.road;
      this.selectedLocation.addrHouseNo=res.house_number;
      this.selectedLocation.addrZipcode=res.postcode;

    })

    this.requiredServiceAccess = this.productService.getProductAvailabilityRequirements(this.product);
    console.log(this.requiredServiceAccess);

    //attribute fuer verfuegbarkeitsabfrage
    this.productService.getAttributeDefByProductItem(this.product.id).subscribe(aDef=>{


      this.saAEndeAttributeDef=this.productService.getServiceAccessAttributeDef(aDef,LocationClassifier.aEnde);
      //console.log("SA Attribute",this.saAEndeAttributeDef);

      this.locationAEndeAttributeDef=this.productService.getLocationAttributeDef(aDef,LocationClassifier.aEnde);
      //console.log("Location Attribute",this.locationAEndeAttributeDef);
      this.loadingDone=true;

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

  private getMatchingServiceAccessObjects():Array<ServiceAccessObject>{

    if (t(this.requiredServiceAccess).isEmptyArray){
      return null;
    }

    let that=this;
    let matches:Array<ServiceAccessObject>=[];
    this.requiredServiceAccess.forEach(reqSA => {
      matches=matches.concat(that.availableServiceAccessObjects.filter(avlb => avlb.serviceAccessSubType === reqSA ));
    });
    console.log(matches);

    return matches;

  }

  isProductAvailable():boolean{

    if (t(this.requiredServiceAccess).isEmptyArray){
      return true;
    }
    let availableSAs=this.availableServiceAccessObjects.map(x=>x.serviceAccessSubType);
    //return true if any of the required ServiceAccessObjects is present in the available ServiceAccessObjects
    return this.requiredServiceAccess.some( ai => availableSAs.includes(ai));

  }

  createInstance(){


    if (this.getMatchingServiceAccessObjects().length != 1){
      //ToDo : Auswahl aus mehreren. <1 sollte hier nicht vorkommen
      this.alertService.danger("Es wurde nicht EXAKT EIN Erschließungsystem gefunden !");
      return;
    }
    if ((this.saAEndeAttributeDef==null)||(this.locationAEndeAttributeDef==null)){
      //ohne attribute zum speichern der service-access-info wird es duenn
      this.alertService.danger("Fehler in Produktdefinition !");
      return;
    }
    let selectedServiceAccessObject=this.getMatchingServiceAccessObjects()[0];

    this.logger.info("ab gehts");

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
            let saAEndeAttributes = svcAttrs.filter(attr => attr.name === this.saAEndeAttributeDef.attributeDef.name);
            if (saAEndeAttributes.length==1){
              let attr:any = saAEndeAttributes[0];
              //get service-access
              //JSON.stringify(selectedServiceAccessObject);
              attr.value=JSON.stringify(selectedServiceAccessObject);
              attrsToUpdate.push(attr);
            }
            //location a-ende
            let locationAEndeAttributes = svcAttrs.filter(attr => attr.name === this.locationAEndeAttributeDef.attributeDef.name);
            if (locationAEndeAttributes.length==1){
              let attr:any = locationAEndeAttributes[0];
              //JSON.stringify(selectedServiceAccessObject);
              attr.value=JSON.stringify(this.selectedLocation);
              attrsToUpdate.push(attr);
            }

            //console.log("attr to update",attrsToUpdate);
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
  }


}
