import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ErrorHandlerService } from './error-handler.service';
import { MessageService } from './message.service';
import { NextRequestState } from './next-request-state';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Intercepts requests to set the correct headers and handle errors
 */
@Injectable({
  providedIn: 'root'
})
export class ApiInterceptor implements HttpInterceptor {
    
  constructor(
    private nextRequestState: NextRequestState,
    private notification: MessageService,
    private errorHandler: ErrorHandlerService
    ) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!req.url.includes('apis.witcom-dev.services')) {
      // This is not a request to the API! proceed as is
      return next.handle(req);
    }

    //Fix broken API-Gen if Body is empty    
    if ((req.method==="POST") &&(req.body===null)){
       req = req.clone({setHeaders: {'Content-Type': 'application/json'}});
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
    
