import { Injectable } from '@angular/core';
import { HttpRequest } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

const CHANNEL = 'Channel';
const AUTHORIZATION = 'Authorization';
const SESSION_TOKEN = 'Session-Token';

@Injectable({
  providedIn: 'root'
})

export class NextRequestState {

  private pending$ = new BehaviorSubject<HttpRequest<any>[]>([]);
  requesting$: Observable<boolean>;

  private nextAuth: string;
  ignoreNextError: boolean;

  constructor() {
    this.requesting$ = this.pending$.asObservable().pipe(
      map(reqs => reqs.length > 0),
      distinctUntilChanged()
    );
  }

  /**
   * Applies the current authorization headers to the next request
   */
  apply(req: HttpRequest<any>): HttpRequest<any> {

    // Apply the headers to the request
    const result = req.clone();

    // Append the resulting request in the pending list
    this.pending$.next([result, ...this.pending$.value]);

    // Just as a fallback, after 15 seconds, remove the request from the pending list
    setTimeout(() => {
      if (this.pending$.value.includes(result)) {
        this.pending$.next(this.pending$.value.filter(r => r !== result));
      }
    }, 15000);

    return result;
  }

  /**
   * Removes the given request from the pending list
   * @param req The request
   */
  finish(req: HttpRequest<any>) {
    this.pending$.next(this.pending$.value.filter(r => r !== req));
  }

  /**
   * Sets the next request to use a basic authentication.
   * Useful only for the request that performs the login.
   * @param principal The user principal
   * @param password The user password
   */
  nextAsBasic(principal: string, password: string): void {
    this.nextAuth = 'Basic ' + btoa(principal + ':' + password);
  }

  /**
   * Sets the next request to be performed as guest
   */
  nextAsGuest(): void {
    this.nextAuth = 'GUEST';
  }

  /**
   * Sets the value of the session token
   */
  set sessionToken(sessionToken: string) {
    if (sessionToken) {
      localStorage.setItem(SESSION_TOKEN, sessionToken);
    } else {
      localStorage.removeItem(SESSION_TOKEN);
    }
  }

  /**
   * Returns the value of the session prefix
   */
  get sessionToken(): string {
    return localStorage.getItem(SESSION_TOKEN);
  }
}

