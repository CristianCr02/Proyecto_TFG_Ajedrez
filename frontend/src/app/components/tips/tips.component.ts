import { Component, OnDestroy, OnInit } from '@angular/core';
import { tips } from '../../../assets/tips';
import { TimeoutConfig } from 'rxjs';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-tips',
  standalone: true,
  imports: [NgClass],
  templateUrl: './tips.component.html',
  styleUrl: './tips.component.css'
})
export class TipsComponent implements OnInit, OnDestroy {
  tips: { title: string, description: string }[] = tips; 
  currentTip: number = 0; 
  showTip: boolean = true;
  intervalId: any | null = null; 

 ngOnInit(): void {
    this.intervalId = setInterval(() => {
      this.showTip = false;
      setTimeout(() => {
        this.currentTip = (this.currentTip + 1) % this.tips.length;
        this.showTip = true;
      }, 1000); // Wait for the animation to finish
    }, 7000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
 
}
