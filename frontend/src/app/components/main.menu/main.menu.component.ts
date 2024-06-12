import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-main.menu',
  standalone: true,
  imports: [NgIf],
  templateUrl: './main.menu.component.html',
  styleUrl: './main.menu.component.css'
})
export class MainMenuComponent {
  username:string = localStorage.getItem('username') ?? '';

  constructor(private router: Router) {}

  newSinglePlayerGame() {
    this.router.navigate(['/game/singleplayer']);
  }

  newNormalGame() {
    this.router.navigate(['/game/normalTwoPlayers']);
  }

  newFastGame() {
    this.router.navigate(['/game/fastTwoPlayers']);
  }

  profile() {
    this.router.navigate(['/profile']);
  }


}
