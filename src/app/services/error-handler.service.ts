import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NextRequestState } from './next-request-state';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor(
    private nextRequestState: NextRequestState,
    private notification: MessageService
  
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
      console.error(err);
      /*
      switch (err.status) {
        case ErrorStatus.INVALID_REQUEST:
          this.handleInvalidRequest();
          return;
        case ErrorStatus.UNAUTHORIZED:
          this.handleUnauthorizedError(error as UnauthorizedError);
          return;
        case ErrorStatus.FORBIDDEN:
          this.handleForbiddenError(error as ForbiddenError);
          return;
        case ErrorStatus.NOT_FOUND:
          this.handleNotFoundError(error as NotFoundError);
          return;
        case ErrorStatus.UNPROCESSABLE_ENTITY:
          this.handleInputError(error as InputError);
          return;
        case ErrorStatus.CONFLICT:
          this.handleConflictError(error as ConflictError);
          return;
        case ErrorStatus.INTERNAL_SERVER_ERROR:
          // The internal server error may be a specific kind or a general error
          if (error != null && error.hasOwnProperty('kind')) {
            switch (error.kind) {
              case ErrorKind.PAYMENT:
                // A payment error
                this.handlePaymentError(error as PaymentError);
                return;
              case ErrorKind.OTP:
                // An error while generating an OTP
                this.handleOtpError(error as OtpError);
                return;
              case ErrorKind.FORGOTTEN_PASSWORD:
                // An error while changing a forgotten password
                this.handleForgottenPasswordError(error as ForgottenPasswordError);
                return;
              case ErrorKind.NESTED:
                // An error in a nested property
                this.handleNestedError(error as NestedError);
            }
          }
      }*/
      // No known specific error was handled
      this.handleGeneralError();
    }

    // The error was not handled yet. Handle as general
    //this.handleGeneralError();
      
      
  }
  public handleGeneralError() {
    this.notification.add(this.general);
  }
  
  private get general(): string {
    return 'There was an unexpected error while processing your request';
  }

}
