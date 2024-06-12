import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Piece } from '../../model/piece';
import { PieceType } from '../../../models/chessPieces';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-promotion-modal',
  standalone: true,
  imports: [NgClass],
  templateUrl: './promotion-modal.component.html',
  styleUrl: './promotion-modal.component.css'
})
export class PromotionModalComponent {
  @Input() pawnToPromote: Piece | null = null;
  @Output() promotionSelected: EventEmitter<PieceType> = new EventEmitter<PieceType>();
  @Output() closeModal: EventEmitter<void> = new EventEmitter<void>();
  @Input() triggerModal: boolean = false;
  // To access PieceType enum in the template
  PieceType = PieceType;

  promote(type: PieceType): void {
    this.promotionSelected.emit(type);
    this.close();
  }

  close() {
    this.pawnToPromote = null;
    this.triggerModal = false;
  }
}
