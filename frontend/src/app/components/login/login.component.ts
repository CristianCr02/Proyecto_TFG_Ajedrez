import { Component } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { RegisterComponent } from '../register/register.component';
import { FormsModule, NgModel } from '@angular/forms';
import { Login } from '../../model/login';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { NotificationComponent } from '../notification/notification.component';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgClass, RegisterComponent, FormsModule, NotificationComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  modalActive: boolean = false;
  username: string = '';
  password: string = '';
  loginInfo: Login = {username: '', password:''};
  error:string = '';
  showSuccessNotification: boolean = false;
  constructor(private userService: UserService, private router: Router) {

  }

  login() {
    this.userService.doLogin(this.loginInfo.username, this.loginInfo.password).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('username', response.username);
        this.router.navigate(['menu']);
      },
      error: (e) => {
        this.error = e;
      }
    });
  }

  triggerModal(): void {
    this.modalActive = true;
  }

  onCloseModal(): void {
    this.modalActive = false;
  }

  isModalActive(): boolean {
    return this.modalActive;
  }

  onSubmit(): void {
    console.log("Usuario registrado: ", this.username, this.password);
  }

  showNotification(): void {
    this.showSuccessNotification = true;
  }
}
