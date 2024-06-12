import { PieceColor, PieceType } from "../../models/chessPieces";

export class Piece {
    image: string = '';

    constructor(
        public type: PieceType,
        public color?: PieceColor,
    ) {
        if (color) {
            this.image = this.getImageForPiece(type, color);
        }
    }

    private getImageForPiece(type: PieceType, color: PieceColor): string {
        const path = `assets/Chess_${type}${color}t45.png`;
        return path;
    }

    promote(newType: PieceType): void {
        if (!this.color) {
            throw new Error('Cannot promote an empty piece.');
        }
        this.type = newType;
        this.image = this.getImageForPiece(newType, this.color);
    }
}