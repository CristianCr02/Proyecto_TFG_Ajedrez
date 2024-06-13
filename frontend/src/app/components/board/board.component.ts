import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PieceColor, PieceType } from '../../../models/chessPieces';
import { NgClass, NgFor, NgIf } from '@angular/common';
import { PieceCoord } from '../../model/types';
import { Piece } from '../../model/piece';


@Component({
  selector: 'app-board',
  standalone: true,
  imports: [NgFor, NgIf, NgClass],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent {

  @Output() pieceClicked: EventEmitter<string> = new EventEmitter<string>();
  @Output() pieceMoved: EventEmitter<PieceCoord[]> = new EventEmitter<PieceCoord[]>();

  @Input() possibleMoves: string[] | null = null;
  private pieceMovedExternally_: PieceCoord[] | null = null;
  @Input()
  set pieceMovedExternally(value: PieceCoord[] | null) {
    this.pieceMovedExternally_ = value;
    if (value) {
      this.movePieceInBoard(value[0], value[1]);
    }
  }
  get pieceMovedExternally(): PieceCoord[] | null {
    return this.pieceMovedExternally_;
  }

  // The piece that is promoted
  private piecePromoted_: { coord: PieceCoord, newType: PieceType } | null = null;
  @Input()
    set piecePromoted(value: { coord: PieceCoord, newType: PieceType } | null) {
      this.piecePromoted_ = value;
      if (value) {
        const coord = value.coord;
        const piece = this.getPieceAtPosition(coord.number, coord.letter);
        this.board[coord.number - 1][this.letterToIndex(coord.letter)] = new Piece(value.newType, piece.color); 
      }
    }
    get piecePromoted(): { coord: PieceCoord, newType: PieceType } | null {
      return this.piecePromoted_;
    }

    // The board is rotated if the player is black
    @Input() isRotated: boolean = false;


  coordLetters: string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
  coordNumbers: number[] = [8, 7, 6, 5, 4, 3, 2, 1];
  board: Piece[][] = [];
  selectedPiece: PieceCoord | null = null;
  empty: Piece = new Piece(PieceType.Empty);
  constructor() {
    this.initBoard();
  }

  letterToIndex(letter: string): number {
    return letter.charCodeAt(0) - 'a'.charCodeAt(0);
  }

  /**
   * Get the piece at a given position
   * @param row 
   * @param letter 
   * @returns 
   */
  getPieceAtPosition(row: number, letter: string): Piece {
    // The board is 1-indexed and the letter is converted to 0-indexed by subtracting the ascii value of 'a' ('a' - 'a' = 0, 'b' - 'a' = 1, ...)
    return this.board[row - 1][this.letterToIndex(letter)];

  }

  /**
   * Check if the move is possible
   * @param row 
   * @param letter 
   * @returns 
   */
  isPossibleMove(row: number, letter: string): boolean {
    if (!this.possibleMoves) {
      return false;
    }
    return this.possibleMoves.some((move) => {
      return move === `${letter}${row}`;
    });
  }

  /**
   * Move the piece icon in the board from src to dst. This method does not update the board state in the api.
   * Refer to movePiece in parent component for that.
   * @param src source coordinates of the piece
   * @param dst destination coordinates of the piece
   */
  movePieceInBoard(src: PieceCoord, dst: PieceCoord): void {
    const srcIndex = this.letterToIndex(src.letter);
    const dstIndex = this.letterToIndex(dst.letter);
    this.board[dst.number - 1][dstIndex] = this.board[src.number - 1][srcIndex];
    this.board[src.number - 1][srcIndex] = this.empty;
    this.selectedPiece = null;
    this.possibleMoves = null;

  }

  /**
   * Handle the click event on a square. If a piece is already selected, check if the move is possible and move the piece.
   * If no piece is selected, select the piece.
   * @param number 
   * @param letter 
   * @returns 
   */
  onClickSquare(number: number, letter: string): void {
    if (this.selectedPiece && this.isPossibleMove(number, letter)) {
      const destination = { number, letter };

      this.pieceMoved.emit([this.selectedPiece, destination]); // Emit the move to the parent component who handles the move in the api
      this.movePieceInBoard(this.selectedPiece, destination); // Move the piece in the board (only frontend)
      return;
    }
    const piece = this.getPieceAtPosition(number, letter);

    if (piece !== this.empty) {
      this.selectedPiece = { number, letter };
      this.pieceClicked.emit(`${letter}${number}`);
    }
  }


  /**
   * Get the image for a piece
   * @param piece 
   * @returns path to the image
   */
  getPieceImage(piece: Piece): string {
    return piece.image;
  }

  /**
   * Initialize the board with the starting position of the pieces
   */
  initBoard(): void {
    this.board = [
      [
        new Piece(PieceType.Rook, PieceColor.White),
        new Piece(PieceType.Knight, PieceColor.White),
        new Piece(PieceType.Bishop, PieceColor.White),
        new Piece(PieceType.Queen, PieceColor.White),
        new Piece(PieceType.King, PieceColor.White),
        new Piece(PieceType.Bishop, PieceColor.White),
        new Piece(PieceType.Knight, PieceColor.White),
        new Piece(PieceType.Rook, PieceColor.White)
      ],
      Array(8).fill(new Piece(PieceType.Pawn, PieceColor.White)),
      Array(8).fill(this.empty),
      Array(8).fill(this.empty),
      Array(8).fill(this.empty),
      Array(8).fill(this.empty),
      Array(8).fill(new Piece(PieceType.Pawn, PieceColor.Black)),
      [
        new Piece(PieceType.Rook, PieceColor.Black),
        new Piece(PieceType.Knight, PieceColor.Black),
        new Piece(PieceType.Bishop, PieceColor.Black),
        new Piece(PieceType.Queen, PieceColor.Black),
        new Piece(PieceType.King, PieceColor.Black),
        new Piece(PieceType.Bishop, PieceColor.Black),
        new Piece(PieceType.Knight, PieceColor.Black),
        new Piece(PieceType.Rook, PieceColor.Black)
      ]
    ];
  }

  /**
   * Check if a square can be selected. A square can be selected if there is a piece on it.
   * @param number 
   * @param letter 
   * @returns 
   */
  canSelectSquare(number: number, letter: string): boolean {
    return this.getPieceAtPosition(number, letter) !== this.empty;
  }

}
