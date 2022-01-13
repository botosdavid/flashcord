const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    text: String,
    username: String,
    time: String,
    room: String
})

module.exports = mongoose.model('Message', messageSchema);