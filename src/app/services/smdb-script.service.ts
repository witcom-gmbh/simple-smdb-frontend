import { Injectable } from '@angular/core';
import { Observable,throwError  } from 'rxjs';
import { catchError, map, tap,flatMap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import t from 'typy';
import {AutomatedScriptingV1Service} from '../api/services';
import { AutomatedScriptDto, ScriptParameterDto  } from '../api/models';
import { HttpErrorResponse } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class SmdbScriptService {

  constructor(
    private scriptService: AutomatedScriptingV1Service
  ) { }

  getScriptByName(name:string):Observable<AutomatedScriptDto>{
    return this.scriptService.AutomatedScriptingFindByNameV1(name);
  }

  getDataSheet(serviceId:number):Observable<Blob>{

    return this.getScriptByName("generate_price_info").pipe(
      flatMap((res:AutomatedScriptDto) => {

        if(!res){
          return throwError('Script for Price-Info not found');
        }
        let params=<AutomatedScriptingV1Service.AutomatedScriptingExecuteV1Params>{};
        params.scriptId=res.id;

        let myParam = {_type:"IntegerScriptParameterDto",name:"serviceId",value:serviceId};
        params.parameters=[];
        params.parameters.push(myParam);
        return this.scriptService.AutomatedScriptingExecuteV1(params) as Observable<Blob>;

      })
      //,catchError(this.handleError)
    );

  }

  private handleError(error: HttpErrorResponse) {
      if (error.error instanceof ErrorEvent) {
        // A client-side or network error occurred. Handle it accordingly.
        console.error('An error occurred:', error.error.message);
      } else {
        // The backend returned an unsuccessful response code.
        // The response body may contain clues as to what went wrong,
        console.error(
          `Backend returned code ${error.status}, ` +
          `body was: ${error.error}`);
      }
      // return an observable with a user-facing error message
      return throwError(
        'Something bad happened; please try again later.');
    };
}
