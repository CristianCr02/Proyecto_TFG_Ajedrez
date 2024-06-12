import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game-over',
  standalone: true,
  imports: [NgClass],
  templateUrl: './game-over.component.html',
  styleUrl: './game-over.component.css'
})
export class GameOverComponent {
  triggerModal: boolean = false;
  @Input() gameResult: string | null = null;
  @Input() moveHistory: string[] = [];
  constructor(private router: Router ) {}


  handleReturnToHome() {
    this.router.navigate(['/menu']);
  }
}
