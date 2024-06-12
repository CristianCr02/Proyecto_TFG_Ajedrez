import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SingleplayerComponent } from '../singleplayer/singleplayer.component';
import { MultiplayerComponent } from '../multiplayer/multiplayer.component';
@Component({
  selector: 'app-game.container',
  standalone: true,
  imports: [SingleplayerComponent, MultiplayerComponent],
  templateUrl: './game.container.component.html',
  styleUrl: './game.container.component.css'
})
export class GameContainerComponent implements OnInit{
  gameType: string = this.route.snapshot.params['type'];
  
  constructor(private route: ActivatedRoute) {

  }

  ngOnInit(): void {
    console.log(this.gameType);
  }


}
