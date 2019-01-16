import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpResponse, HttpHeaders , HttpParameterCodec, HttpParams,HttpErrorResponse} from '@angular/common/http';
import { Observable,throwError,of } from 'rxjs';
import { map , filter as __filter } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';

import { NominatimConstant } from "./nominatim.constant";
import { GeocodeResponse } from "./geocode.response";

@Injectable({
  providedIn: 'root'
})
export class NominatimService {

    constructor(
        private http: HttpClient
    ) {
      
      
    }
    
    addressSearch(searchQuery:string):Observable<GeocodeResponse[]>{
        
        searchQuery = searchQuery.trim();

        if (searchQuery === null){
            return of(null);
        }
        // Add safe, URL encoded search parameter if there is a search term
        const options = searchQuery ? {
            params: new HttpParams().set('q', searchQuery)
            .set('addressdetails',"1")
            .set('polygon_geojson',"0")
            .set('format',"json")
        } : {};
        
        return this.http.get<GeocodeResponse[]>(NominatimConstant.GEOCODING_ENDPOINT,options)
        .pipe(
        /*
            map(res => {
                res.map(addr => {
                    if (addr.address.town !==undefined) {addr.address.city=addr.address.town}
                    if (addr.address.village !==undefined) {addr.address.city=addr.address.village}

                    return addr;}
                )
                console.log(res); 
                return res;
            }),*/
            catchError(this.handleError)
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
