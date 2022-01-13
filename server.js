const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const { Server } = require("socket.io");
const io = new Server(server);

const { 
    getRoomUsers,
    renderHomePage,
    renderRoomPage,
    createRoomInDataBase,
    saveUserInDataBase,
    deliverMessage,
    saveMessageInDataBase,
    deleteUserInDataBase
} = require('./utils/rooms');

//server config
app.use(express.static('./public'));
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true}));

//routes
app.get('/', renderHomePage);

app.get('/:roomId', renderRoomPage);


//socketio setup
io.on('connection', (socket) => {

    console.log('user connected');
    socket.on('create-room', async roomName => {
        const room = await createRoomInDataBase(roomName);
        io.emit('show-created-room', room );
    })
    socket.on('connected-to-room', async (username, roomId) => {
        socket.join(roomId);
        const user = await saveUserInDataBase(socket.id, username, roomId);
        await deliverMessage(socket, 'Joined!');
        const users = await getRoomUsers(user.room);
        io.sockets.in(user.room).emit('room-users', users);
    });
    socket.on('send-message', async (message) => {
        await deliverMessage(socket, message);
        await saveMessageInDataBase(socket, message);
    })
    socket.on('disconnect', async () => {
        await deliverMessage(socket, 'Disconnected!'); 
        const user = await deleteUserInDataBase(socket);
        if(!user) return;
        const users = await getRoomUsers(user.room);
        io.sockets.in(user.room).emit('room-users', users);
    })
})

server.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});