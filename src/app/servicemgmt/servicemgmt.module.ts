import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceConfigComponent } from './service-config/service-config.component';
export { ServiceConfigComponent } from './service-config/service-config.component';
import { AppRoutingModule } from '../app-routing.module';
import { SvcitemConfigComponent } from './svcitem-config/svcitem-config.component';
import {SharedModule} from '../shared/shared.module';
import { FormioModule } from 'angular-formio';

@NgModule({
  declarations: [ServiceConfigComponent, SvcitemConfigComponent],
  imports: [
    CommonModule,
    AppRoutingModule,
    SharedModule,
    FormioModule
  ],
  exports: [
    ServiceConfigComponent,
    SvcitemConfigComponent
  ]
})
export class ServicemgmtModule { }
