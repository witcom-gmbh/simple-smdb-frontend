import { Injectable } from '@angular/core';
import { Observable,throwError,of,empty  } from 'rxjs';
import { catchError, map, tap,flatMap } from 'rxjs/operators';
import {ServiceAccessObject, ServiceAccessSource} from '../../models';

@Injectable({
  providedIn: 'root'
})
export class DSLAMAvailabilityCheckService {

  constructor() { }

  checkForDSLAM():Observable<Array<ServiceAccessObject>>{

    //create fake Service-Access-Object
    let saObjects:Array<ServiceAccessObject>=[];

    let saObject = <ServiceAccessObject>{};
    saObject.source=ServiceAccessSource.DSLAM_LISTE;
    saObject.serviceAccessSubType="DSLAM";
    saObject.name="MY RANDOM DSLAM";
    saObjects.push(saObject);

    var random_boolean = Math.random() < 0.5;
    if (random_boolean){
      return of(saObjects);
    }

    return of(null);


  }
}
