import { Component, OnInit } from '@angular/core';
import {ServiceManagementService} from '../../../services/services';
import t from 'typy';
import { NGXLogger } from 'ngx-logger';
import { AlertService } from 'ngx-alerts';
import {Subscription} from 'rxjs'; 


//ServiceManagementService
@Component({
  selector: 'smdb-test-instantiate',
  templateUrl: './test-instantiate.component.html',
  styleUrls: ['./test-instantiate.component.css']
})
export class TestInstantiateComponent implements OnInit {

  constructor(
  
        private logger: NGXLogger,
        private alertService: AlertService,
        private serviceMgmt:ServiceManagementService,
  
  ) { }

  ngOnInit() {
  }
  
  createInstance(){
      
      this.serviceMgmt.instantiateBusinessServiceFromProdukt(10371658,true).subscribe(
      response => {
          //Todo aus dem Service-Tree das Service-Element filtern, das aus dem Produkt instanziiert wurde
          console.log(response.serviceGroups[0].services[0].service.id); 
          //Weiterleiten
      },
        err => {
           console.log(err);
           this.alertService.danger('Service konnte nicht instanziiert werden');

        });

      
  }

}
