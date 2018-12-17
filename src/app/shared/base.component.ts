import { Injector, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NextRequestState } from '../services/next-request-state';
import { Observable, Subscription } from 'rxjs';
import { MessageService } from '../services/message.service';
import { ErrorHandlerService } from '../services/error-handler.service';


/**
 * Base class to meant to be inherited by other components.
 * By contract, all subclasses that override the ngOnInit or ngOnDestroy
 * MUST call the super implementation too, or the component state
 * may become inconsistent.
 */
export abstract class BaseComponent implements OnInit, OnDestroy {
    
    errorHandler: ErrorHandlerService;
    notification: MessageService;
    formBuilder: FormBuilder;
    router: Router;
    route: ActivatedRoute; 
    requesting$: Observable<boolean>;
    
    constructor(injector: Injector) {
    this.errorHandler = injector.get(ErrorHandlerService);
    this.notification = injector.get(MessageService);
    this.router = injector.get(Router);
    this.route = injector.get(ActivatedRoute);
    this.formBuilder = new FormBuilder();
    this.requesting$ = injector.get(NextRequestState).requesting$;
    }

    
    ngOnInit() {
        
    }
    
    ngOnDestroy(): void {
        
    }


}
    
