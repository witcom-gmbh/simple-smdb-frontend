import { Component, OnInit } from '@angular/core';
import { KeycloakService, KeycloakAuthGuard } from 'keycloak-angular';

@Component({
  selector: 'simple-user-info',
  templateUrl: './simple-user-info.component.html',
  styleUrls: ['./simple-user-info.component.css']
})
export class SimpleUserInfoComponent implements OnInit {

    private userProfile:Keycloak.KeycloakProfile;
    private loggedIn:boolean=false;
    
  constructor(private keycloakAngular: KeycloakService) { }

  ngOnInit() {
      
     this.keycloakAngular.isLoggedIn().then(res => {
         if (res){
            this.keycloakAngular.loadUserProfile().then(res => {
                this.userProfile = res;
                this.loggedIn=true;
            });
         }
     });
  }

}
