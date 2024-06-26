import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PieceCoord } from '../model/types';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  type: string = '';
  private apiURL: string = environment.API_URL;
  constructor(private http: HttpClient) { }

  newSinglePlayerGame() {
    this.type = 'one';
    return this.http.get(this.apiURL + `/${this.type}`);
  }

  newMultiplayerGame() {
    this.type = 'two';
  }


  checkPossibleMoves(game_id: string, position: string): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    const body = new URLSearchParams();
    body.set('position', position);
    body.append('game_id', game_id);
    return this.http.post(this.apiURL + `/${this.type}/moves`, body.toString(), { headers });
  }

  movePieceByPlayer(game_id: string, from: PieceCoord, to: PieceCoord): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    const body = new URLSearchParams();
    body.set('from', `${from.letter}${from.number}`);
    body.append('to', `${to.letter}${to.number}`);
    body.append('game_id', game_id);
    return this.http.post(this.apiURL + '/one/move/player', body.toString(), { headers });
  }

  movePieceByPlayerWithPromotion(game_id: string, from: PieceCoord, to: PieceCoord, promotion: string): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    const body = new URLSearchParams();
    body.set('from', `${from.letter}${from.number}`);
    body.append('to', `${to.letter}${to.number}`);
    body.append('promotion', promotion);
    body.append('game_id', game_id);
    return this.http.post(this.apiURL + '/one/move/player', body.toString(), { headers });
  }

  movePieceByBot(game_id: string): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    const body = new URLSearchParams();
    body.append('game_id', game_id);
    return this.http.post(this.apiURL + '/one/move/ai', body.toString(), { headers });
  }

  checkCheckMate(game_id: string): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    const body = new URLSearchParams();
    body.append('game_id', game_id);
    return this.http.post(this.apiURL + '/one/check', body.toString(), { headers });
 
  }

  getAllMoves(game_id: string): Observable<string[]> {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    const body = new URLSearchParams();
    body.append('game_id', game_id);
    return this.http.post<string[]>(this.apiURL + '/allMoves', body.toString(), { headers });
  }

  promotePawn(game_id: string, san: string): Observable<any> {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    const body = new URLSearchParams();
    body.append('game_id', game_id);
    body.append('san', san);
    return this.http.post(this.apiURL + '/one/promote', body.toString(), { headers });
  }
}
