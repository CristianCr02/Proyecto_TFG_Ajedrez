import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../model/user';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})


export class UserService {

  private backendURL: string = environment.BACKEND_URL;
  constructor(private http: HttpClient, private router: Router) { 

  }

  doLogin(username: string, password: string): Observable<any> {

   return this.http.post<any>(this.backendURL + '/login', {username, password});
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
    return this.http.post<any>(this.backendURL + '/register', {username, email, password});
  }

  doVerification(token: string): Observable<any> {
    const header = new HttpHeaders({
      'Authorization': token
    });
    return this.http.post<any>(this.backendURL + '/verify', {header});
  }

  getProfileInfo(): Observable<User> {
    return this.http.get<User>(this.backendURL + '/profile');
  }

  incrementWins(username: string): Observable<any> {
    return this.http.post<any>(this.backendURL + '/profile/wins', {username: username});
  }

  incrementLosses(username: string): Observable<any> {
    return this.http.post<any>(this.backendURL + '/profile/losses', {username: username});
  }
}