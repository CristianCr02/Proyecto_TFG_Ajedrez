import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../model/user';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { backendURL } from '../model/config';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root'
})


export class UserService {


  constructor(private http: HttpClient, private router: Router) { 

  }

  doLogin(username: string, password: string): Observable<any> {

   return this.http.post<any>(backendURL + '/login', {username, password});
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('loggedIn') === 'true';
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.router.navigate(['/login']);
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http.post<any>(backendURL + '/register', {username, email, password});
  }

  doVerification(token: string): Observable<any> {
    const header = new HttpHeaders({
      'Authorization': token
    });
    return this.http.post<any>(backendURL + '/verify', {header});
  }

  getProfileInfo(): Observable<User> {
    return this.http.get<User>(backendURL + '/profile');
  }

  incrementWins(username: string): Observable<any> {
    return this.http.post<any>(backendURL + '/profile/wins', {username: username});
  }

  incrementLosses(username: string): Observable<any> {
    return this.http.post<any>(backendURL + '/profile/losses', {username: username});
  }
}