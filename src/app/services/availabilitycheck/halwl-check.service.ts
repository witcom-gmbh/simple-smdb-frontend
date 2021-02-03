import { Injectable } from '@angular/core';
import { Observable,throwError,of,empty  } from 'rxjs';
import { catchError, map, tap,flatMap } from 'rxjs/operators';
import {ServiceAccessObject, ServiceAccessSource,ServiceAccessStatus} from '../../models';

@Injectable({
  providedIn: 'root'
})
export class HALwlCheckService {

  constructor() { }

    checkForServiceAccess():Observable<Array<ServiceAccessObject>>{

    //create fake Service-Access-Object
    let saObjects:Array<ServiceAccessObject>=[];

    let saObject = <ServiceAccessObject>{};
    saObject.source=ServiceAccessSource.SERVICEACCESS_DB;
    saObject.serviceAccessSubType="HA_LWL";
    saObject.name="MY RANDOM HALWL";

    var random_boolean_state = Math.random() < 0.5;
    if (random_boolean_state){
      saObject.status=ServiceAccessStatus.ACTIVE;
    } else {
      saObject.status=ServiceAccessStatus.PLANNING;
    }

    saObjects.push(saObject);

    var random_boolean = Math.random() < 0.7;

    if (random_boolean){
      return of(saObjects);
    }

    return of(null);


  }
}
