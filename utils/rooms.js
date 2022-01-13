const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const moment = require('moment');

const Room = require('../models/Room');
const User = require('../models/User');
const Message = require('../models/Message');

mongoose.connect(process.env.DATABASE_URL,{ useNewUrlParser: true }, () => {
    console.log('Connected to Mongo DataBase!');
})

const renderHomePage = async (req,res) => {
    try{
        const rooms = await Room.find();
        return res.render('home', { rooms : rooms });
    }catch{
        console.error('Error while searching rooms');
    }
}

const renderRoomPage = async (req,res) => {
    try{
        const room = await Room.findOne({ _id: req.params.roomId})
        const messages = await Message.find({ room: req.params.roomId });
        return res.render('room', { room: room , messages: messages });
    }catch{
        console.error('Room not found in database!');
    }
}

const createRoomInDataBase = async (roomName) => {
    const newRoom = new Room({
        name: roomName
    })
    try{
        const room = await newRoom.save();
        console.log('succes saving room');
        return room;
    }catch{
        console.error('Error while saving room');
    }
}

const saveUserInDataBase = async (socketId, username, roomId) => {
    const newUser = new User({
        name: username,
        socketId: socketId,
        room: roomId
    })
    try{
        const user = await newUser.save();
        console.log('Success saving User');
        return user;
    }catch{
        console.error('Error while saving user');
    }
}

const deliverMessage = async (socket, message) => {
    try{
        const time = moment().format('H:mm:ss, M-D-YYYY');
        const user = await User.findOne({ socketId: socket.id });
        if(!user) return;
        socket.to(user.room).emit('recieve-message', message, user.name, time);
        console.log(`delivered`);
    }catch{
        console.error('Error while delivering message!');
    }
}

const getRoomUsers = async (roomId) => {
    try{
        const users = await User.find({ room: roomId });
        console.log('Success getting room users.');
        return users;
    }catch{
        console.error('Error while searching for room users.');
    }
}

const saveMessageInDataBase = async (socket ,message) => {
    try{
        const user = await User.findOne({ socketId: socket.id });
        const time = moment().format('H:mm:ss, M-D-YYYY');
        const newMessage = new Message({
            text: message,
            username: user.name,
            time: time,
            room: user.room
        })
        const savedMessage = await newMessage.save();
        console.log('Success saving message.');
    }catch{
        console.error('Error while saving message.');
    }
    
}

const deleteUserInDataBase = async (socket) => {
    try{
        const user = await User.findOne({ socketId: socket.id});
        if(!user) return;
        await User.findByIdAndDelete(user._id);
        return user;
    }catch{
        console.error('Error while deleteing user.');
    }
}

module.exports = {
    renderHomePage,
    renderRoomPage,
    createRoomInDataBase,
    saveUserInDataBase,
    deliverMessage,
    getRoomUsers,
    saveMessageInDataBase,
    deleteUserInDataBase
};