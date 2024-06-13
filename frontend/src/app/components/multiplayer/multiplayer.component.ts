import { Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BoardComponent } from '../board/board.component';
import { NavigationEnd, Router } from '@angular/router';
import { PieceCoord } from '../../model/types';
import { WebsocketService } from '../../services/websocket.service';
import { GameService } from '../../services/game.service';
import { DatePipe, Time } from '@angular/common';
import { GameOverComponent } from '../game-over/game-over.component';
import { TipsComponent } from '../tips/tips.component';
import { Subscription, timeout } from 'rxjs';
import { UserService } from '../../services/user.service';
@Component({
  selector: 'app-multiplayer',
  standalone: true,
  imports: [BoardComponent, DatePipe, GameOverComponent, TipsComponent],
  templateUrl: './multiplayer.component.html',
  styleUrl: './multiplayer.component.css'
})
export class MultiplayerComponent implements OnDestroy, OnInit {
  private wsSubscription: Subscription | null = null;

  rivalUsername: string = '';
  game_id: string = '';
  username: string;
  color: string = '';
  turn: boolean = false;
  status: string = '';
  timer: any | null = null;
  @Input() selectedPiece: PieceCoord | null = null;
  @Output() pieceMovedExternally: PieceCoord[] | null = null;
  possibleMoves: string[] | null = null;

  player1: string = '';
  player2: string = '';

  player1Time: number = 300000;
  player2Time: number = 300000;


  gameStatus: string = '';
  modalActive: boolean = false;
  moves: string[] = [];

  currentPlayer: string = '';

  promotionModalActive: boolean = false;
  promotedPiece: { coord: PieceCoord, newType: string } | null = null;

  ngOnInit(): void {
    console.log("Multiplayer init");
    this.wsSubscription = this.ws.subscribeToMessages().subscribe(
      (msg: any) => {
        if (msg.type === 'matchFound') {
          this.handleStartGame(msg);
        } else if (msg.type === 'pieceMoved') {
          this.update(msg);
        } else if (msg.type === 'updateTime') {
          this.updateTime(msg);
        } else if (msg.type === 'opponentLeft') {
          this.gameStatus = 'Your opponent left the game!';
          this.gameOver(this.gameStatus);
        } else if (msg.type === 'gameOver') {
          this.handleGameOver(msg);
        } else if (msg.type === 'gameOverDraw') {
          this.gameStatus = msg.state;
          this.gameOver(msg.state);
        } else if (msg.type === 'timeout') {
          this.ws.timeout(this.game_id);
        }
      }
    );
  }

  constructor(private router: Router, private userService: UserService, private ws: WebsocketService, private gameService: GameService) {
    this.username = localStorage.getItem('username') ?? '';
    
    const currentUrl = this.router.url;

    if (currentUrl.includes('normalTwoPlayers')) {
      this.player1Time = 300000;
      this.player2Time = 300000;
    } else if (currentUrl.includes('fastTwoPlayers')) {
      this.player1Time = 60000;
      this.player2Time = 60000;
    }
    
    ws.enterPool(this.username, this.player1Time);
   
  }

  ngOnDestroy(): void {
    console.log("Multiplayer destroy")
    this.closeSocket();
    clearInterval(this.player1Time);
    clearInterval(this.player2Time);
  }

  closeSocket(): void {
    if (!this.game_id) {
      this.ws.exitPool();
    } else {
      this.ws.closeSocket(this.game_id);
      localStorage.removeItem('game_id');
      this.game_id = '';
    }
    this.router.navigate(['/menu']);
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
      this.wsSubscription = null;
    }
    window.location.reload();
  }

  exitPool(): void {
    console.log("Exiting pool");
    this.ws.exitPool();
    this.wsSubscription?.unsubscribe();
  }

  handleGameOver(gameOvermsg: { type: string, status: string, winner: string, loser: string}) {
    this.gameStatus = gameOvermsg.winner === this.username ? 'You win!' : 'You lose!';
    this.gameOver(this.gameStatus);
  }

  /**
   * Handles the start of a game in multiplayer mode.
   * 
   * @param msg - The message containing game details.
   * @returns void
   */
  handleStartGame(msg: any): void {
    this.rivalUsername = msg.opponentUsr;
    this.game_id = msg.game_id;
    this.color = msg.color;
    this.player1 = msg.player1;
    this.player2 = msg.player2;
    this.turn = this.color === 'white';
    this.currentPlayer = this.player1;
    console.log(this.currentPlayer);
    this.timer = setInterval(() => {
      if (this.currentPlayer === this.player1) {
        this.player1Time -= 1000;
        if (this.player1Time <= 0) {
          clearInterval(this.timer);
        }
      } else {
        this.player2Time -= 1000;
        if (this.player2Time <= 0) {
          clearInterval(this.timer);
        }
      }
    }, 1000);

    this.gameService.newMultiplayerGame();
  }

  /**
   * Updates the game state based on the received message (move of the other player).
   * 
   * @param msg - The message containing the move details.
   */
  update(msg: any): void {
    const src: PieceCoord = {number: msg.from.number, letter: msg.from.letter};
    const dst: PieceCoord = {number: msg.to.number, letter: msg.to.letter};
    this.pieceMovedExternally = [src, dst];
    this.turn = true;
    this.currentPlayer = this.username;
    this.updateTime(msg);
  }

  pieceClicked(event: string): void {
    if (!this.turn) {
      return;
    }
    this.checkPossibleMoves(event);
  }

  movePiece(pieceCoords: PieceCoord[]): void {
    if (!this.turn) {
      return;
    }
    
    this.gameService.movePieceByPlayer(this.game_id, pieceCoords[0], pieceCoords[1]).subscribe(() => {
      this.turn = false;
      this.currentPlayer = this.rivalUsername;
      this.selectedPiece = null;
      // Update the board of the other player
      this.ws.updateBoard(pieceCoords, this.game_id);
    });
  }

  checkPossibleMoves(position: string): void {
    this.gameService.checkPossibleMoves(this.game_id, position).subscribe((data: any) => {
      this.possibleMoves = data.moves;
    })
  }

  updateTime(msg: any): void {
    this.player1Time = msg.timePlayer1;
    this.player2Time = msg.timePlayer2;
  }

  gameOver(status: string): void {
    clearInterval(this.timer);    
    this.gameService.getAllMoves(this.game_id).subscribe((data: any) => {
          this.moves = data.chess_moves;
          this.triggerModal();
      });
  }

  isModalActive(): boolean {  
    return this.modalActive;
  }

  triggerModal(): void {
    this.modalActive = true;
  }
}
