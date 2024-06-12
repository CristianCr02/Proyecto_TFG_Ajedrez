import { Component } from '@angular/core';
import { User } from '../../model/user';
import { UserService } from '../../services/user.service';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  userInfo: User = new User();

  constructor(private userService: UserService) {
    this.userService.getProfileInfo().subscribe({
      next: (user: User) => {
        this.userInfo = user;
        console.log(user.gamesWon);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }

  logout() {
    this.userService.logout();
  }
}
