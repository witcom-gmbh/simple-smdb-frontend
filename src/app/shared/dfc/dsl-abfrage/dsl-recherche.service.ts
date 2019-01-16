import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpResponse, HttpHeaders , HttpParameterCodec, HttpParams,HttpErrorResponse} from '@angular/common/http';
import { Observable,throwError,of } from 'rxjs';
import { map , filter as __filter } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import { NgxXml2jsonService } from 'ngx-xml2json';

export interface DSLRechercheAdresse {
    strasse: string;
    hausnummer:string;
    hausnummernzusatz: string;
    plz:string;
    ort: string;
    ortsteil: string;
    kls:string;    
}

@Injectable({
  providedIn: 'root'
})
export class DslRechercheService {

    constructor(
        private http: HttpClient,
        private ngxXml2jsonService: NgxXml2jsonService
    ) { }
    
    addressSearch(addresse:DSLRechercheAdresse):Observable<any>{
        console.log(addresse); 

        const formData = new FormData();
        
        formData.append('strasse',addresse.strasse);
        formData.append('hausnummer',addresse.hausnummer.toString());
        if (addresse.hausnummernzusatz){
            formData.append('hausnummernzusatz',addresse.hausnummernzusatz);
        }

        formData.append('plz',addresse.plz.toString());
        formData.append('ort',addresse.ort);
        if (addresse.ortsteil){
            formData.append('ortsteil',addresse.ortsteil);
        }
        if (addresse.kls){
            formData.append('kls',addresse.kls.toString());
        }

       
        let headers= {'Authorization':'Basic ' + btoa("5307:cra56j3")};
      
        const options = {headers, responseType: 'text' as 'text'};

        return this.http.post("https://apis.witcom-dev.services/dslrecherche/dslabfrage_wsss.php",formData,options)
        .pipe(
            map(results => {
                
                let retObject:any = this.parseXMLResponse(results);
                return retObject;
                
            }),
            catchError(this.handleError)
        );

        //.subscribe(res => {console.log(res)},err=>{console.error("fehler  ",err)});

    }
    
    private handleError(error: HttpErrorResponse) {
        console.log(error);
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
    
    private parseXMLResponse(results:string){
        results = results.replace(/(\r\n\t|\n|\r\t)/gm, "");
                results = results.replace(/>\s*/g, '>');  // Remove space after >
                results = results.replace(/\s*</g, '<');  // Remove space before <
        
        const parser = new DOMParser();
        const xml = parser.parseFromString(results, 'text/xml');
        const obj = this.ngxXml2jsonService.xmlToJson(xml);
        
        return obj;

        
    }

    
    
}
