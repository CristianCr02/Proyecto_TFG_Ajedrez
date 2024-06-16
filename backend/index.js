require('dotenv').config();
require('./model/db');

const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const cors = require('cors');

const secret = process.env.JWT_SECRET;

const app = express();
app.use(bodyParser.json());
app.use(cors());

const expressWs = require('express-ws')(app);
const router = require('./routes');

app.use((req, res, next) => {
    if (req.path === '/api/register' || req.path === '/api/login' || req.path === '/api/ws/.websocket') {
        return next();
    }
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ message: "JWT missing" });
    }
    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid JWT token' });
        }
        req.username = decoded.username;
        next();
    });
})

app.use('/api', router);



app.listen(4000, () => {
    console.log("Server up");
})
