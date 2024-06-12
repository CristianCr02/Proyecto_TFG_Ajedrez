export class User  {
    id_: number;
    username: string;
    email: string;
    password: string;
    creationDate: Date | undefined;
    gamesWon: number;
    gamesLost: number;

    constructor() {
        this.id_ = 0;
        this.username = '';
        this.email = '';
        this.password = '';
        this.gamesWon = 0;
        this.gamesLost = 0;
    }
}