import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';

import { webSocket} from 'rxjs/webSocket'
import { backendURL } from '../model/config';
import { PieceCoord } from '../model/types';
interface Response {
  type: string;
  turn: number;
}
@Injectable({
  providedIn: 'root'
})

export class WebsocketService {
  private socket$;

  constructor() { 
   this.socket$ = webSocket('ws://localhost:4000/api' + '/ws');
   this.socket$.subscribe(
    msg => console.log('Server message: ', msg),
    err => console.error('Connection error: ', err),
    () => console.log('Connection closed')
  );
  }

  subscribeToMessages() {
    return this.socket$;
  }

  enterPool(usr: string, time: number) {
    this.socket$.next({ event: 'enter-pool', username: usr, time: time });
  }

  closeSocket(game_id: string) {
    this.socket$.next({event: 'closeGame', game_id: game_id});
    console.log('Closing socket');
    this.socket$.unsubscribe();
  }

  endGame(game_id: string) {
    this.socket$.next({event: 'endGame', game_id: game_id});
    this.socket$.unsubscribe();
  }

  exitPool() {
    this.socket$.next({event: 'exitPool'});
  }

   getTurn(): Observable<number> {
    return new Observable<number>(observer => {
      this.socket$.next({event: 'get-turn'});
  
      const subscription = this.socket$
        .subscribe(
          (message: any) => {
            if (message.type === 'current-turn') {
              observer.next(message.turn);
              observer.complete();
            }
          },
          (error: any) => observer.error(error),
          () => observer.complete()
        );
  
      return () => subscription.unsubscribe();
    });
  }

  updateBoard(pieceCoords: PieceCoord[], game_id: string) {
    this.socket$.next({event: 'move', from: pieceCoords[0], to: pieceCoords[1], game_id: game_id});
  }

  changeTurn() {
    this.socket$.next('change-turn');
  }

  timeout(game_id: string) {
    this.socket$.next({event: 'timeout', game_id: game_id});
  }

  
}
