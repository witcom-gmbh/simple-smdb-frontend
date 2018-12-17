import { NgModule,forwardRef,Provider } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { MessageService } from './message.service';
import { ErrorHandlerService } from './error-handler.service';
import { ApiInterceptor } from './api.interceptor';
import {ServiceItemService} from './service-item.service';

export const API_INTERCEPTOR_PROVIDER: Provider = {
  provide: HTTP_INTERCEPTORS,
  useExisting: forwardRef(() => ApiInterceptor),
  multi: true
};

@NgModule({
  declarations: [],
  providers: [
    MessageService,
    ServiceItemService,
    ErrorHandlerService,
    ApiInterceptor,
    API_INTERCEPTOR_PROVIDER
  ],
  imports: [
    CommonModule
  ],
})
export class ServicesModule { }
