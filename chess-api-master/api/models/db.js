const mongoose = require('mongoose');
const db = process.env.MONGO_URL || 'mongodb://localhost:27017/chessApi';

mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true});

mongoose.connection.on('connected', function() {
    console.log('Mongoose database is connected on: ' + db);
});

mongoose.connection.on('disconnected', function() {
    console.log('Mongoose is disconnected.');
});

mongoose.connection.on('error', function(err) {
    console.log('Mongoose encountered an error: ' + err);
});

process.on('SIGINT', function() {
    console.log('Goodbye from mongoose! :)');
    process.exit(0);
});
