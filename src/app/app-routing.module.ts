import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServiceConfigComponent} from './servicemgmt/service-config/service-config.component';
import { HomeComponent} from './home/home.component';
import { FormTestComponent } from './servicemgmt/form-test/form-test.component';

const routes: Routes = [
  {
      path: 'service-config/:id', component: ServiceConfigComponent},
      {
      path: 'home', component: HomeComponent      
    },
    { path: '', redirectTo: '/home', pathMatch: 'full' },
      {
      path: 'formtest', component: FormTestComponent      
    }
];

@NgModule({
     imports: [ RouterModule.forRoot(routes) ],
     exports: [ RouterModule ]
})
export class AppRoutingModule { }
