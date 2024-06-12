const websocket = require('ws');
const server = new websocket.Server({port: 3001});
let playerQueue = [];
let sockets = [];


server.on('connection', function(socket) {
    sockets.push(socket);
    console.log('socket connected');
    socket.send(JSON.stringify({type: 'playersInQueue', message: sockets.length}))
    socket.on('message', function incoming(message) {
        const parsedMessage = JSON.parse(message);
        switch (parsedMessage) {
            case 'enter-pool':
                playerQueue.push(socket);
                socket.send(JSON.stringify({type: 'prueba', message: 'conectado'}))
                matchMaking();
                break;
            default:
                console.log("error");
        }
    })
})


function matchMaking() {
    if (playerQueue.length >= 2) {
        const player1 = playerQueue.shift();
        const player2 = playerQueue.shift();
        player1.send(JSON.stringify({type: 'matchFound', opponentId: player2}));
        player2.send(JSON.stringify({type: 'matchFound', opponentId: player1}));
    }
}