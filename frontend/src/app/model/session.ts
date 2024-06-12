import { HttpClient } from "@angular/common/http";
import { User } from "./user";
import { Observable, of } from "rxjs";

export class Session {
    private loggedUser: User | undefined;

    constructor(private http: HttpClient) {

    }

    doLoginUser(user: User): void {
        this.loggedUser = user;
    }

    doLogoutUser(): void {
        this.loggedUser = undefined;
    }

   
}