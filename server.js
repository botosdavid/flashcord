const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const PORT = process.env.port || 3000;
const { Server } = require("socket.io");
const io = new Server(server);

const { 
    createRoom,
    getRooms,
    getRoom,
    addUserToRoom,
    getUserName,
    getUserRoom,
    deleteUserFromRoom,
    messageDeliver,
    getRoomUsers
} = require('./utils/rooms');

//server config
app.use(express.static('./public'));
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true}));

//routes
app.get('/', (req,res) => {
    res.render('home', { rooms : getRooms() });
})

app.get('/:roomId', (req,res) => {
    const room = getRoom(req.params.roomId);
    res.render('room', { room: room })
})

//socketio setup
io.on('connection', (socket) => {

    console.log('user connected');
    socket.on('create-room', roomName => {
        const room = createRoom(roomName);
        io.emit('show-created-room', room );
    })
    socket.on('connected-to-room', (username, roomId) => {
        socket.join(roomId);
        addUserToRoom(roomId, socket.id, username );
        messageDeliver(socket, 'Joined to room!');
        io.sockets.in(roomId).emit('room-users', getRoomUsers(roomId));
    });
    socket.on('send-message', message => {
        messageDeliver(socket, message);
    })
    socket.on('disconnect', () => {
        const roomId = getUserRoom(socket.id);
        messageDeliver(socket, 'Disconnected!');
        deleteUserFromRoom(socket.id);
        if(!roomId) return;
        io.sockets.in(roomId).emit('room-users', getRoomUsers(roomId));
    })
    
})

server.listen(PORT);