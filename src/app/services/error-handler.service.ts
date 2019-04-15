import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NextRequestState } from './next-request-state';
import { NGXLogger } from 'ngx-logger';
import { AlertService } from 'ngx-alerts';

export enum ErrorStatus {
  /**
   * The request itself was not done
   */
  INVALID_REQUEST = 0,

  /**
   * Status Code: 401.
   */
  UNAUTHORIZED = 401,

  /**
   * Status Code: 403.
   */
  FORBIDDEN = 403,

  /**
   * Status Code: 404.
   */
  NOT_FOUND = 404,

  /**
   * Status Code: 409.
   */
  CONFLICT = 409,

  /**
   * Status Code: 422.
   */
  UNPROCESSABLE_ENTITY = 422,

  /**
   * Status Code: 500.
   */
  INTERNAL_SERVER_ERROR = 500
}


@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor(
    private nextRequestState: NextRequestState,
    private logger: NGXLogger,
    private alertService: AlertService,
  
  ) { }
  
  /**
   * Handles an from the given Http response
   * @param err The response object
   */
  handleHttpError(err: HttpErrorResponse) {
      
    if (err.error instanceof Error) {
      // Client-side error
      console.error('Client-side request error');
      console.error(err.error);
    } else {
      // Server-generated error
      let error = err.error;
      if (typeof error === 'string') {
        try {
          error = JSON.parse(error);
        } catch (e) {
          error = null;
        }
      }
      console.error(err.status);

      switch (err.status) {
        case ErrorStatus.INVALID_REQUEST:
          this.handleInvalidRequest();
          return;
        case ErrorStatus.UNAUTHORIZED:
          this.handleUnauthorizedError(error);
          return;
        case ErrorStatus.FORBIDDEN:
          this.handleForbiddenError(error);
          return;
        case ErrorStatus.NOT_FOUND:
          this.handleNotFoundError(error);
          return;
        case ErrorStatus.UNPROCESSABLE_ENTITY:
          this.handleInputError(error);
          return;
        /*  
        case ErrorStatus.CONFLICT:
          this.handleConflictError(error as ConflictError);
          return;
        */  
        default:
            this.handleGeneralError();
      }
      
    }
      
  }
  
  public handleForbiddenError(error){
    if (error == null) {
      return null;
    }
    this.logger.error("Forbidden :",error); 
    this.alertService.danger("API-Zugriff verboten");
  }

  
  public handleGeneralError() {
      this.logger.error(this.general);
      this.alertService.danger("Fehler beim Zugriff auf API");
  }

  public handleInputError(error) {
     this.logger.error("Invalid request ",error);  
     this.alertService.danger("Fehler beim Zugriff auf API");
  }

  
  public handleInvalidRequest() {
     this.logger.error("Cannot process request");  
     this.alertService.danger("Fehler beim Zugriff auf API");
  }

  
  public handleNotFoundError(error){
    if (error == null) {
      return null;
    }
    this.logger.error("Resource not found:",error); 
    this.alertService.danger("API-Resource nicht gefunden");
  }
  
  public handleUnauthorizedError(error){
    if (error == null) {
      return null;
    }
    this.logger.error("Unauthorized :",error); 
    this.alertService.danger("API-Zugriff nicht authorisiert");
  }
  
  
  private get general(): string {
    return 'There was an unexpected error while processing your request';
  }

}
