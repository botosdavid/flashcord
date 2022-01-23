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
        if(!req.user) return;
        const userGoogleId = req.user.googleId;
        const rooms = await Room.find();
        return res.render('home', { 
            rooms : rooms, 
            googleId: userGoogleId, 
            picture: req.user.picture,
            email: req.user.email,
            name: req.user.name
        });
    }catch(err){
        console.error('Error while searching rooms');
    }
}

const renderRoomPage = async (req,res) => {
    try{
        const userGoogleId = req.user.googleId;
        const room = await Room.findOne({ _id: req.params.roomId});
        const messages = await Message.find({ room: req.params.roomId });
        return res.render('room', { room: room , messages: messages, googleId: userGoogleId });
    }catch{
        console.error('Room not found in database!');
    }
}

const createRoomInDataBase = async (roomName) => {
    const newRoom = new Room({ name: roomName })
    try{
        const room = await newRoom.save();
        return room;
    }catch{
        console.error('Error while saving room');
    }
}

const saveUserSocketInDataBase = async (socket, googleId) => {
    try{
        const user = await User.findOneAndUpdate({ googleId: googleId},{socketId: socket.id});
    }catch(err){
        console.error('Error while saving usersocket to db')
    }
}

const deliverMessage = async (socket, message) => {
    try{
        const time = moment().format('H:mm:ss, M-D-YYYY');
        const user = await User.findOne({ socketId: socket.id });
        if(!user) return;
        const room = [...socket.rooms].pop();
        socket.to(room).emit('recieve-message', message, user.name, time);
        console.log(`delivered`);
    }catch{
        console.error('Error while delivering message!');
    }
}

const getUser = async (socketId) => {
    try{ return  await User.findOne({socketId: socketId});
    }catch{ console.error('Error while searching user'); }
}

const getRoomUsers = async (socket,io,room) => {
    try{
        if(!room) return;
        if(!io.sockets.adapter.rooms.get(room)) return;
        const sockets = [...io.sockets.adapter.rooms.get(room)];
        const users = [];
        console.log(sockets);
        if(!sockets || sockets.length == 0) return;
        for(const socketId of sockets){
            const user = await getUser(socketId);
            if(user) users.push(user);
        }
        return users;
    }catch(err){
        console.error('Error while searching for room users');
        console.log(err)
    }
}

const saveMessageInDataBase = async (socket ,message) => {
    try{
        const user = await User.findOne({ socketId: socket.id });
        const time = moment().format('H:mm:ss, M-D-YYYY');
        const room = [...socket.rooms].pop();
        const newMessage = new Message({
            text: message,
            username: user.name,
            time: time,
            room: room
        })
        const savedMessage = await newMessage.save();
        console.log('Success saving message.');
    }catch{
        console.error('Error while saving message.');
    }   
}

const isLoggedIn = (req, res, next) => {
    if(!req.user) return res.redirect('/google');
    next();
}

module.exports = {
    isLoggedIn,
    getRoomUsers,
    renderHomePage,
    renderRoomPage,
    deliverMessage,
    saveMessageInDataBase,
    createRoomInDataBase,
    saveUserSocketInDataBase
};