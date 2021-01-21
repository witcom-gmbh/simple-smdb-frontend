import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ErrorHandlerService } from './error-handler.service';
import { NextRequestState } from './next-request-state';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';


/**
 * Intercepts requests to set the correct headers and handle errors
 */
@Injectable({
  providedIn: 'root'
})
export class ApiInterceptor implements HttpInterceptor {

  constructor(
    private nextRequestState: NextRequestState,
    private errorHandler: ErrorHandlerService
    ) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!req.url.includes(environment.apiUrl)) {
      // This is not a request to the API! proceed as is
      return next.handle(req);
    }

    //Fix broken API-Gen if Body is empty
    if ((req.method==="POST") &&(req.body===null)){
      //console.log("fix broken api");
      req=req.clone({
        headers: req.headers.set('Content-Type', 'application/json'),
      });
    }
    const ignoreError = this.nextRequestState.ignoreNextError;
    // ... but immediately clear the flag, as it is only for the next request (which is this one)
    this.nextRequestState.ignoreNextError = false;

    req = this.nextRequestState.apply(req);

    // Also handle errors globally
    return next.handle(req).pipe(
      tap(x => {

        if (x instanceof HttpResponse) {
          this.nextRequestState.finish(req);
        }
        return x;
      }, err => {
          this.nextRequestState.finish(req);
          if (!ignoreError) {
          this.errorHandler.handleHttpError(err);
          }
      })
    );
  }
}

