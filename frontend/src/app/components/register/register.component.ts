import { Component, EventEmitter, Output } from '@angular/core';
import { UserService } from '../../services/user.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  triggerModal: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() registeredSuccessfully = new EventEmitter<void>();
  username: string = '';
  email: string = '';
  password: string = '';

  constructor(private userService: UserService) {}

  onSubmit() {
    this.userService.register(this.username, this.email, this.password).subscribe(
      (response) => {
        this.onCloseModal();
        this.registeredSuccessfully.emit();
      }, (error) => {
        console.error('Error on register: ', error);
      }
    );
  }

  onCloseModal(): void {
    this.close.emit();
  }
}
