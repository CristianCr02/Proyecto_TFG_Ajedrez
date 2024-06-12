const chessuwu = require('chess.js');
let chess = new chessuwu.Chess();
chess.move({from: 'e2', to: 'e4'});
chess.move({from: 'f1', to: 'c4'});
chess.move({from: 'e1', to: 'h5'});
console.log(chess.ascii());
console.log(chess.moves({square: 'h5', piece: 'Q'}))