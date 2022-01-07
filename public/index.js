const url = window.location.href.slice(0, -1);;
const socket = io(url, {transports: ['websocket']});
const roomButton = document.querySelector('#room-button');
const roomInput = document.querySelector('#room-input');
const roomContainer = document.querySelector('#rooms-container');
const messageForm = document.querySelector('#message-form');
const messagesContainer = document.querySelector('#messages-container');
const messageButton = document.querySelector('#message-button');
const messageInput = document.querySelector('#message-input');
const usersContainer = document.querySelector('#users-container');

if(roomButton){
    roomButton.addEventListener('click', (e) => {
        e.preventDefault();
        let roomName = roomInput.value;
        socket.emit('create-room', roomName );
        roomInput.value = '';
    })
}

if(messageForm){
    const roomId = window.location.href.split('/').pop();
    let username = prompt('Name: ');
    if(username == '' || username == null) username = 'Guest';
    socket.emit('connected-to-room',  username, roomId );


    messageButton.addEventListener('click', (e) => {
        e.preventDefault();
        const message = messageInput.value;
        const time = getTime();
        showMessage(message, 'You', time);
        socket.emit('send-message', message );
        messageInput.value = '';
    })
}

socket.on('show-created-room', room => {
    showRoom(room);
})

socket.on('recieve-message', (message, username, time) => {
    showMessage(message, username, time);
})

socket.on('room-users', users => {
    updateRoomUsers(users);
})

const showRoom = (room) => {
    const div = document.createElement('div');
    const link = document.createElement('a');
    const container = document.createElement('div');
    div.innerText = room.name;
    link.href = `/${room.id}`;
    link.innerText = 'Join';
    container.append(div);
    container.append(link);
    roomContainer.append(container);
    roomInput.value = '';
}

const showMessage = (message, username, time) => {
    const messageContainer = document.createElement('div');
    const messageText = document.createElement('b');
    messageText.innerText = message;
    const timeText = document.createElement('p');
    timeText.innerText = time;
    const nameText = document.createElement('p');
    nameText.innerText = username;
    messageContainer.append(nameText);
    messageContainer.append(timeText);
    messageContainer.append(messageText);
    messagesContainer.append(messageContainer);
}

const updateRoomUsers = (users) => {
    usersContainer.innerHTML = '';
    users.forEach( user => {
        const userContainer = document.createElement('div');
        userContainer.innerText = user.name;
        usersContainer.append(userContainer);
    })
}

const getTime = () => {
    const today = new Date();
    const date = (today.getMonth()+1) +'-'+today.getDate() +'-'+ today.getFullYear();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime = time+', '+date;
    return dateTime;
}