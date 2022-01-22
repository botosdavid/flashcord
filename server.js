const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const { Server } = require("socket.io");
const io = new Server(server);
const passport = require('passport');
const session = require("express-session")({
  secret: "my-secret",
  resave: true,
  saveUninitialized: true
})
require('./utils/passport');

const { 
    isLoggedIn,
    getRoomUsers,
    renderHomePage,
    renderRoomPage,
    deliverMessage,
    createRoomInDataBase,
    saveMessageInDataBase,
    saveUserSocketInDataBase
} = require('./utils/functions');

//server config
app.use(express.static('./public'));
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true}));
app.use(session);
app.use(passport.initialize());
app.use(passport.session());

app.get('/google', passport.authenticate('google', { scope: ['profile','email'],prompt: 'select_account' }));
app.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/google' }),
  function(req, res) {
    res.redirect('/');
  });

//routes
app.get('/',isLoggedIn, renderHomePage);
app.get('/:roomId',isLoggedIn, renderRoomPage);

// socketio setup
io.on('connection', (socket) => {
    let room = null;
    console.log('User Connected');
    socket.on('create-room', async roomName => {
        const room = await createRoomInDataBase(roomName);
        io.emit('show-created-room', room );
    })
    socket.on('connected-to-room', async (googleId, roomId) => {
        socket.join(roomId);
        room = roomId;
        await saveUserSocketInDataBase(socket, googleId);
        await deliverMessage(socket, 'Joined!');
        const users = await getRoomUsers(socket,io,room); 
        io.sockets.in(room).emit('room-users', users);
    });
    socket.on('send-message', async (message) => {
        await deliverMessage(socket, message);
        await saveMessageInDataBase(socket, message);
    })
    socket.on('disconnect', async () => {
        if(!room) return;
        const users = await getRoomUsers(socket, io, room);        
        io.sockets.in(room).emit('room-users', users);
    })
})

server.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});