import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpResponse, HttpHeaders , HttpParameterCodec, HttpParams,HttpErrorResponse} from '@angular/common/http';
import { Observable,throwError } from 'rxjs';
import { map as __map, filter as __filter } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';



@Injectable({
  providedIn: 'root'
})
export class MockApiSearchService {
    constructor(
        private http: HttpClient
    ) { }
    
    search(searchUrl:string,term:string):Observable<any>{
        
        term = term.trim();
        // Add safe, URL encoded search parameter if there is a search term
        const options = term ? { params: new HttpParams().set('q', term) } : {};
        return this.http.get(searchUrl,options)
        .pipe(
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
