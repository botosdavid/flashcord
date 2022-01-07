const moment = require('moment');
let roomId = 0;
let rooms = [];

const createRoom = roomName => {
    roomId++;
    const room = {
        id: roomId + '',
        name: roomName,
        users: []
    }
    rooms.push(room);
    return room;
}

const getRooms = () => {
    return rooms;
}

const getRoom = (roomId) => {
    return rooms.find( room => room.id == roomId);
}

const addUserToRoom = (roomId, userId, userName) => {
    const roomIndex = rooms.findIndex( room => room.id == roomId);
    const user = { id: userId , name: userName };
    rooms[roomIndex].users.push(user);
}

const getUserName = (userId) => {
    const username = rooms.reduce((username, currentRoom) => {
        const user = currentRoom.users.find( user => user.id == userId);
        if(user) return user.name;
        return username;
    }, '')
    return username;
}

const getUserRoom = (userId) => {
    const room = rooms.find( room => {
        const user = room.users.find( user => user.id == userId );
        return user;
    })
    if(!room) return null;
    return room.id;
}

const deleteUserFromRoom  = (userId ) => {
    const roomId = getUserRoom(userId);
    if(!roomId) return;
    const roomIndex = rooms.findIndex( room => room.id == roomId);
    rooms[roomIndex].users = rooms[roomIndex].users.filter( user => user.id != userId);
}

const getRoomUsers = (roomId) => {
    return getRoom(roomId).users;
}

const messageDeliver = (socket, message) => {
    const username = getUserName(socket.id);
    const roomId = getUserRoom(socket.id);
    const time = moment().format('H:mm:ss, M-D-YYYY');
    socket.to(roomId).emit('recieve-message', message, username, time);
}

module.exports = { 
    createRoom,
    getRooms,
    getRoom,
    addUserToRoom,
    getUserName,
    getUserRoom,
    deleteUserFromRoom,
    messageDeliver,
    getRoomUsers
};