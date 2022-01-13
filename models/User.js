const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    socketId: String,
    room: String
})

module.exports = mongoose.model('User', userSchema);