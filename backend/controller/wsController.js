require('dotenv').config();
const axios = require('axios').default;
const Game = require('../model/game');
const apiUrl = process.env.API_URL;
const userController = require('./userController')
let games = new Map();
let gast = new Map();
let normalPlayerQueue = [];
let fastPlayerQueue = [];


const EVENT_ENTER_POOL = 'enter-pool';
const EVENT_CLOSE = 'closeGame';
const EVENT_MOVE = 'move';
const EVENT_TIMEOUT = 'timeout';
const MESSAGE_TYPE_NOTIFICATION = 'notification';
const MESSAGE_TYPE_PIECE_MOVED = 'pieceMoved';
const MESSAGE_TYPE_MATCH_FOUND = 'matchFound';
const MESSAGE_TYPE_UPDATE_TIME = 'updateTime';
const MESSAGE_TYPE_OPPONENT_LEFT = 'opponentLeft';
const MESSAGE_TYPE_GAME_OVER = 'gameOver';
const MESSAGE_TYPE_GAME_OVER_DRAW = 'gameOverDraw';
const EXIT_POOL = 'exitPool';
const NORMAL_GAME_TYPE = 300000;
const FAST_GAME_TYPE = 60000;

class PieceCoord {
    constructor(number, letter) {
        this.number = number;
        this.letter = letter;
    }
};

/**
 * Handles WebSocket connections.
 *
 * @param {WebSocket} ws - The WebSocket connection.
 * @param {http.IncomingMessage} req - The HTTP request object.
 */
const ws = (ws, req) => {
    ws.on('message', (message) => {
        let parsedMessage;
        try {
            parsedMessage = JSON.parse(message);
        } catch (error) {
            console.log('error parsing message: ', error);
            return;
        }
       
       
        switch (parsedMessage.event) {
            case EVENT_ENTER_POOL:
                handleEnterPool(ws, parsedMessage.username, parsedMessage.time);
                break;
            case EVENT_MOVE:
                handleMove(ws, parsedMessage);
                break;
            case EVENT_CLOSE:
                handleClose(ws, parsedMessage.game_id);
                break;
            case EXIT_POOL:
                handleExitPool(ws);
                break;
            case EVENT_TIMEOUT:
                handleGameOverDueToTimeout(games[parsedMessage.game_id]);
                break;
            default:
                console.log("error");
        }
    })
};

/**
 * Handles the process of adding a player to the player queue and sending a notification message.
 *
 * @param {WebSocket} ws - The WebSocket object representing the client connection.
 * @param {string} username - The username of the player.
 * @param {number} time - The time limit for each player's turn.
 */
const handleEnterPool = (ws, username, time) => {
    ws.send(JSON.stringify({ type: MESSAGE_TYPE_NOTIFICATION, message: 'connected' }))
    matchMaking({ socket: ws, usr: username, time: time });
};

/**
 * Handles the closing of a WebSocket connection. If the connection is part of a game, the game is closed and the other player is notified.
 *
 * @param {WebSocket} ws - The WebSocket connection to be closed.
 */
const handleClose = async (ws, game_id) => {
    
    let game = games[game_id];
    if (!game) {
        console.error('game not found');
        normalPlayerQueue = normalPlayerQueue.filter(p => p.socket !== ws);
        fastPlayerQueue = fastPlayerQueue.filter(p => p.socket !== ws);
        ws.close();
        return;
    }
    if (game.player1.socket === ws) {
        game.player2.socket.send(JSON.stringify({ type: MESSAGE_TYPE_OPPONENT_LEFT, message: 'opponent disconnected' }));
        await userController.incLosses(game.player1.usr);
        await userController.incWins(game.player2.usr);
    } else {
        game.player1.socket.send(JSON.stringify({ type: MESSAGE_TYPE_OPPONENT_LEFT, message: 'opponent disconnected' }));
        await userController.incLosses(game.player2.usr);
        await userController.incWins(game.player1.usr);
    }
    game.player1.socket.close();
    game.player2.socket.close();
    games.delete(game_id);

};

const handleExitPool = (ws) => {
    normalPlayerQueue = normalPlayerQueue.filter(p => p.socket !== ws);
    fastPlayerQueue = fastPlayerQueue.filter(p => p.socket !== ws);
    ws.close();
}

/**
 * Handles the move of a chess piece.
 * 
 * @param {WebSocket} ws - The WebSocket connection.
 * @param {Object} parsedMessage - The parsed message containing the game ID, from coordinates, and to coordinates.
 */
const handleMove = (ws, parsedMessage) => {
    let game = games[parsedMessage.game_id];
    let from = new PieceCoord(parsedMessage.from.number, parsedMessage.from.letter);
    let to = new PieceCoord(parsedMessage.to.number, parsedMessage.to.letter);
    let other = game.player1.socket === ws ? game.player2.socket : game.player1.socket;
    game.switchPlayer();
    verifyState(parsedMessage.game_id).then((response) => {
        let status = response.data.status;
        if (status === 'check mate' || status === 'in stalemate' || status === 'in draw' || status === 'in threefold repetition' || status === 'insufficient material') {
            other.send(JSON.stringify({ type: MESSAGE_TYPE_GAME_OVER, state: status }));
            ws.send(JSON.stringify({ type: MESSAGE_TYPE_GAME_OVER, state: status }));
            if (status === 'check mate') {
                let winner = game.currentPlayer === game.player1 ? game.player2.usr : game.player1.usr;
                let loser = game.currentPlayer === game.player1 ? game.player1.usr : game.player2.usr;
                userController.incWins(winner);
                userController.incLosses(loser);
                other.send(JSON.stringify({ type: MESSAGE_TYPE_GAME_OVER, state: status, winner: winner, loser: loser }));
                ws.send(JSON.stringify({ type: MESSAGE_TYPE_GAME_OVER, state: status, winner: winner, loser: loser }));
            } else {
                other.send(JSON.stringify({ type: MESSAGE_TYPE_GAME_OVER_DRAW, state: status }));
                ws.send(JSON.stringify({ type: MESSAGE_TYPE_GAME_OVER_DRAW, state: status }));
            }
            other.close();
            ws.close();
            games.delete(parsedMessage.game_id);
         } else {
            other.send(JSON.stringify({ type: MESSAGE_TYPE_PIECE_MOVED, from: from, to: to, timePlayer1: game.player1.time, timePlayer2: game.player2.time, state: response.data.status }));
            ws.send(JSON.stringify({ type: MESSAGE_TYPE_UPDATE_TIME, timePlayer1: game.player1.time, timePlayer2: game.player2.time, state: response.data.status }));
         }
        });
    };

/**
 * Handles the matchmaking process for creating new games.
 */
const matchMaking = (player) => {
    let queue = player.time === NORMAL_GAME_TYPE ? normalPlayerQueue : fastPlayerQueue;
    if (queue.length >= 1) {
        let index = queue.findIndex(p => p.usr !== player.usr);
        
        if (index === -1) {
            queue.push(player);
            return;
        }

        const player1 = player;
        const player2 = queue.splice(index, 1)[0];
        createNewGame().then((response) => {
            const game_id = response.data.game_id;
            const [color1, color2] = assignColors();
            const p1 = color1 === 'white' ? player1 : player2;
            const p2 = p1 === player1 ? player2 : player1;
            let game = new Game(game_id, p1.socket, p2.socket, player.time, p1.usr, p2.usr);
            games[game_id] = game;
            player1.socket.send(JSON.stringify({ type: MESSAGE_TYPE_MATCH_FOUND, opponentUsr: player2.usr, game_id: game_id, color: color1, player1: p1.usr, player2: p2.usr }));
            player2.socket.send(JSON.stringify({ type: MESSAGE_TYPE_MATCH_FOUND, opponentUsr: player1.usr, game_id: game_id, color: color2, player1: p1.usr, player2: p2.usr}));
            game.startTimer();
        });
    } else {
        queue.push(player);
    
    }
};

/**
 * Assigns random colors to players.
 * @returns {Array} An array containing two colors assigned to players.
 */
const assignColors = () => {
    const color1 = Math.random() < 0.5 ? 'white' : 'black';
    const color2 = color1 === 'white' ? 'black' : 'white';
    return [color1, color2];
};

/**
 * Creates a new game.
 * @returns {Promise<Object|null>} The response object if successful, or null if an error occurred.
 */
const createNewGame = async () => {
    try {
        const response = await axios.get(apiUrl + '/two');
        return response;
    } catch (error) {
        console.log('Internal Server Error');
        return null;
    }
};

const verifyState = async (game_id) => {
    try {
        const response = await axios.post(apiUrl + '/two/check', {game_id});
        return response;
    } catch (error) {
        console.log('Error response from API');
        return null;
    }
}

const handleGameOverDueToTimeout = (game) => {
    if (!game) {
        return;
    }

    const winner = game.player1.time <= 0 ? game.player2 : game.player1;
    const loser = winner === game.player1 ? game.player2 : game.player1;

    winner.socket.send(JSON.stringify({ type: MESSAGE_TYPE_GAME_OVER, state: 'Timeout', winner: winner.usr, loser: loser.usr }))
    loser.socket.send(JSON.stringify({ type: MESSAGE_TYPE_GAME_OVER, state: 'Timeout', winner: winner.usr, loser: loser.usr }))
    
    userController.incWins(winner.usr);
    userController.incLosses(loser.usr);

    winner.socket.close();
    loser.socket.close();

    games.delete(game.game_id);
}

module.exports = {
    ws,
    handleGameOverDueToTimeout
};