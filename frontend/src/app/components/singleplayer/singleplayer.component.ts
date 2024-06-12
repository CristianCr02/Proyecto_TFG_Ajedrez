import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { BoardComponent } from '../board/board.component';
import { GameService } from '../../services/game.service';
import { PieceCoord } from '../../model/types';
import { LogsComponent } from '../logs/logs.component';
import { GameOverComponent } from '../game-over/game-over.component';
import { PieceType } from '../../../models/chessPieces';
import { PromotionModalComponent } from '../promotion-modal/promotion-modal.component';
import { Piece } from '../../model/piece';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-singleplayer',
  standalone: true,
  imports: [BoardComponent, LogsComponent, GameOverComponent, PromotionModalComponent],
  templateUrl: './singleplayer.component.html',
  styleUrl: './singleplayer.component.css'
})
export class SingleplayerComponent implements OnInit {
  @Input() selectedPiece: PieceCoord | null = null;
  @Output() pieceMovedExternally: PieceCoord[] | null = null;
  @ViewChild(PromotionModalComponent) promotionModal!: PromotionModalComponent;
  possibleMoves: string[] | null = null;
  username: string = localStorage.getItem('username') ?? '';
  turn: boolean = true;
  game_id: string = '';
  gameStatus: string = '';
  modalActive: boolean = false;
  promotionModalActive: boolean = false;
  moves: string[] = [];
  promotePiece: { coord: PieceCoord, newType: PieceType } | null = null;
  selectedPromotionPiece: PieceType = PieceType.Empty;
  selectedCoordsPromotionPiece: PieceCoord = { number: 0, letter: '' };

  constructor(private gameService: GameService, private userService: UserService) { }

  ngOnInit(): void {
    this.gameService.newSinglePlayerGame().subscribe((data: any) => {
      this.game_id = data.game_id;
    });
  }

  /**
   * Checks the possible moves for a given position on the chessboard.
   * @param position The position on the chessboard to check for possible moves.
   */
  checkPossibleMoves(position: string): void {
    this.gameService.checkPossibleMoves(this.game_id, position).subscribe((data: any) => {
     this.possibleMoves = data.moves;
    });
  }
  
  /**
   * Handles the click event on a chess piece.
   * @param event - The event string representing the clicked piece.
   */
  pieceClicked(event: string): void {
    this.checkPossibleMoves(event);
  }

  /**
   * Moves a chess piece on the board. This method does not update the frontend, it only sends a request to the backend to move the piece.
   * 
   * @param pieceCoords - An array of PieceCoord objects representing the starting and ending coordinates of the piece.
   * @returns void
   */
  movePiece(pieceCoords: PieceCoord[]): void {
    if (this.promotionModalActive) {
      return;
    }
    if (this.selectedPromotionPiece != PieceType.Empty) {
      this.gameService.movePieceByPlayerWithPromotion(this.game_id, pieceCoords[0], pieceCoords[1], this.selectedPromotionPiece).subscribe(() => {
        this.turn = false;
        this.selectedPiece = null;
        this.checkCheckMate();
        this.movePieceByBot();
      });
    } else {
      this.gameService.movePieceByPlayer(this.game_id, pieceCoords[0], pieceCoords[1]).subscribe(() => {
        this.turn = false;
        this.selectedPiece = null;
        this.checkCheckMate();
        this.movePieceByBot();
      }
      );
    }
    
  }


  /**
   * Move a piece using AI. This method is called after the player has moved a piece.
   * Note that this method DOES NOT update the frontend. 
   * There is a delay of 1 second before the AI moves a piece.
   */
  movePieceByBot(): void {
    if (this.turn) {
      return
    }
    setTimeout(() => {
      this.gameService.movePieceByBot(this.game_id).subscribe((response) => {
        this.turn = true;
        const src: PieceCoord = { number: response.from.charAt(1), letter: response.from.charAt(0) };
        const dst: PieceCoord = { number: response.to.charAt(1), letter: response.to.charAt(0) };
        this.pieceMovedExternally = [src, dst];
        // Check if the move requires promotion
        const pieceToPromote: string = this.canPromote(response.san);
        if (pieceToPromote) {
          this.promotePiece = { coord: dst, newType: pieceToPromote.toLowerCase() as PieceType };
        }
        // ------------------------------
        this.checkCheckMate();
      });
    }, 1000);
    
  }


  /**
   * Checks if the game has reached a checkmate, draw, stalemate, or other end game conditions.
   * Updates the game status accordingly and triggers a modal if the game has ended.
   */
  checkCheckMate(): void {
    this.gameService.checkCheckMate(this.game_id).subscribe((data: any) => {
      this.gameStatus = data.status;

      switch (data.status) {
        case 'check mate':
          if (this.turn) {
            this.gameStatus = 'You lose!';
            this.userService.incrementLosses(this.username).subscribe();
          } else {
            this.gameStatus = 'You win!';
            this.userService.incrementWins(this.username).subscribe();
          }
          break;
        case 'draw':
          this.gameStatus = 'Draw!';
          break;
        case 'in stalemate':
          this.gameStatus = 'Stalemate!';
          break;
        case 'in threefold repetition':
          this.gameStatus = 'Draw. Threefold repetition!';
          break;
        case 'insufficient material':
          this.gameStatus = 'Draw. Insufficient material!';
          break;
        default:
          break;
      }
      if (data.status !== 'game continues') {
        this.gameService.getAllMoves(this.game_id).subscribe((data: any) => {
          this.moves = data.chess_moves;
          this.triggerModal();  
        });
      }
    });
  }

  isModalActive(): boolean {  
    return this.modalActive;
  }

  triggerModal(): void {
    this.modalActive = true;
  }

  closeModal(): void {
    this.modalActive = false;
  }

  /**
   * Determines if a move requires promotion and returns the promoted piece.
   * @param san - The Standard Algebraic Notation (SAN) of the move.
   * @returns The promoted piece (Q, R, B, N) if the move requires pro
   * motion, otherwise an empty string.
   */
  canPromote(san: string): string {
    const regex: RegExp = new RegExp(/=(Q|R|B|N|q|r|b|n)/);
    const match = san.match(regex);
    return match !== null ? match[1] : '';
  }

  promotePlayerPawn(coords: {number: number, letter: string}): Promise<string> {
    return new Promise(resolve => {
      this.promotionModalActive = true;
      this.selectedCoordsPromotionPiece = { number: coords.number, letter: coords.letter };
      const subscription = this.promotionModal.promotionSelected.subscribe((type: PieceType) => {
        this.promotionModalActive = false;
        resolve(type.toString());
        subscription.unsubscribe();
      });
    })
  }

  onPromotionSelected(type: PieceType): void {
    this.selectedPromotionPiece = type;
    this.promotionModalActive = false;
  }

}
