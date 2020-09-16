import { NgModule,forwardRef,Provider } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorHandlerService } from './error-handler.service';
import { ApiInterceptor } from './api.interceptor';
import { ServiceItemService } from './service-item.service';
import { MockApiSearchService } from './mock-api-search.service'
import { SmdbPartnerService } from './smdb-partner.service'
import {NominatimService} from './Nominatim/nominatim.service';
import { ServiceManagementService } from './service-management.service'
import { ProductSearchService} from './product-search.service'
import { ServiceSearchService} from './service-search.service'
import {ProductService} from './product.service';
import {AttributeProcessorService} from './attribute-processor.service'

export const API_INTERCEPTOR_PROVIDER: Provider = {
  provide: HTTP_INTERCEPTORS,
  useExisting: forwardRef(() => ApiInterceptor),
  multi: true
};

@NgModule({
  declarations: [],
  providers: [
    ServiceItemService,
    ErrorHandlerService,
    ApiInterceptor,
    API_INTERCEPTOR_PROVIDER,
    MockApiSearchService,
    SmdbPartnerService,
    NominatimService,
    ServiceManagementService,
    ProductSearchService,
    ServiceSearchService,
    ProductService,
    AttributeProcessorService
  ],
  imports: [
    CommonModule
  ],
})
export class ServicesModule { }
