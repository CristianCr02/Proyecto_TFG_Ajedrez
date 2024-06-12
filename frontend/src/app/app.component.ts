import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { BoardComponent } from './components/board/board.component';
import { UserService } from './services/user.service';
@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    imports: [RouterOutlet, LoginComponent, BoardComponent]
})
export class AppComponent implements OnInit {
    constructor(private router: Router, private userService: UserService) { }

    ngOnInit(): void {
        const token: string = localStorage.getItem('token') ?? '';
        if (!token) {
            this.router.navigate(['/login']);
            return;
        }
        this.userService.doVerification(token).subscribe({
            next: () => {
                this.router.navigate(['/menu']);
            }, // 401 Error if not verified
            error: (e) => {
                this.router.navigate(['/login']);
            }
        });
    }
}
