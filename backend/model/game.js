wsController = require('../controller/wsController');
class Game {
    /**
     * @type string
     */
    gameId;
    player1;
    player2;
    currentPlayer;
    timerId;
    wsController;
    constructor(gameId, socket1, socket2, time, usr1, usr2) {
        this.gameId = gameId;
        this.player1 = { socket: socket1, time: time, usr: usr1 };
        this.player2 = { socket: socket2, time: time, usr: usr2 };
        this.currentPlayer = this.player1;
        this.timerId = null;
    }

    startTimer() {
        if (this.timerId) {
            clearInterval(this.timerId);
        }

        this.timerId = setInterval(() => {
            this.currentPlayer.time -= 1000;
            if (this.currentPlayer.time <= 0) {
                this.currentPlayer.socket.send(JSON.stringify({ type: 'timeout' }));
                clearInterval(this.timerId);
            }
        }, 1000);
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === this.player1 ? this.player2 : this.player1;
        this.startTimer();
    }
}

module.exports = Game
