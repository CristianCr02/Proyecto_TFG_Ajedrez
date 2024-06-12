require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../model/user');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const secret = process.env.JWT_SECRET;




/**
 * Logs in a user with the provided username and password.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object containing the token and username if successful, or an error message if unsuccessful.
 */
const loginUser = async (req, res) => {
    const {username, password} = req.body;
    try {
        const user = await User.findOne({username});
        if (!user) {
            return res.status(401).json({message: 'Username does not exists'});
        }
        const hash = await bcrypt.hash(password, user.salt);
        if (hash !== user.passwordHash) {
            return res.status(401).json({message: 'Incorrect password'});
        }
        const token = jwt.sign({id: user._id, username: user.username}, secret);
        return res.json({token, username: user.username});
    } catch (error) {
        return res.status(500).json({message: 'Internal Server Error'});
    }
}


/**
 * Registers a new user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with a success or error message.
 */
const registerUser = async (req, res) => {
    const {username, email, password} = req.body;
    try {
        const existingUser = await User.findOne({username});
        if (existingUser) {
            return res.status(400).json({message: 'Username already in use'});
        }
        const { hash, salt } = await generateHash(password);
        const user = new User({username, email, passwordHash: hash, salt: salt});
        await user.save();
        return res.json({message: 'User registered successfully'});
    } catch (error) {
        return res.status(500).json({message: 'Internal Server Error'});
    }

}


/**
 * Verifies the authenticity of a token.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The response object with a status and message indicating the validity of the token.
 */
const verifyToken = async (req, res) => {
    const token = req.header('Authorization');
    try {
        const data = jwt.verify(token, secret);
        return res.status(200).json({message: 'Valid token', data});
    } catch (error) {
        return res.status(401).json({message: 'Invalid token'});
    }
}

/**
 * Retrieves the profile information of a user.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {Object} The user profile information.
 */
const getProfileInfo = async (req, res) => {
    try {

        const user = await User.findOne({username: req.username});
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        return res.json(user);
    } catch (error) {
        return res.status(500).json({message: 'Internal Server Error'});
    }
}


const incrementWins = async (req, res) => {
    try {
        const updatedUser = await incWins(req.body.username);

        if (!updatedUser) {
            res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ message: 'Games won incremented', user: updatedUser });
    } catch (error) {
        return res.status(500).json({message: 'Server error'});
    }
}

const incrementLosses = async (req, res) => {
    try {
        const updatedUser = await incLosses(req.body.username);

        if (!updatedUser) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        return res.status(200).json({ message: 'Games lost incremented', user: updatedUser });
    } catch (error) {
        return res.status(500).json({message: 'Server error'});
    }
}

const incWins = async (username) => {
    const updatedUser = await User.findOneAndUpdate(
        { username: username },
        { $inc: { gamesWon: 1} },
        { new: true }
    );
    return updatedUser;
}


const incLosses = async (username) => {
    const updatedUser = await User.findOneAndUpdate(
        { username: username },
        { $inc: { gamesLost: 1} },
        { new: true }
    );
    return updatedUser;
}

/**
 * Generates a hash and salt for the given password.
 * @param {string} password - The password to generate the hash for.
 * @returns {Promise<{ hash: string, salt: string }>} - A promise that resolves to an object containing the hash and salt.
 */
const generateHash = async (password) => {
    const salt = await generateSalt();
    const hash = await bcrypt.hash(password, salt);
    return { hash, salt };
};

/**
 * Generates a salt for password hashing.
 * @returns {Promise<string>} A promise that resolves to the generated salt.
 */
const generateSalt = async () => {
    return bcrypt.genSalt(saltRounds);
}



module.exports = {
    loginUser,
    registerUser,
    verifyToken,
    getProfileInfo,
    incrementWins,
    incrementLosses,
    incWins,
    incLosses
}
