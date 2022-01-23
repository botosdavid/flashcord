const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    socketId: String,
    googleId: String,
    picture: String,
    email: String
})

module.exports = mongoose.model('User', userSchema);