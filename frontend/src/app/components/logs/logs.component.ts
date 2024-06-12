import { Component } from '@angular/core';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [],
  templateUrl: './logs.component.html',
  styleUrl: './logs.component.css'
})
export class LogsComponent {
  moves: string[] = ["prueba1", "prueba2", "prueba3", "prueba4", "prueba5"];
}
