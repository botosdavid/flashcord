const url = window.location.href.split('/').slice(0, -1).join('/');
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
    messageInput.focus();
    
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
    const container = document.createElement('h4');
    div.innerText = room.name;
    link.href = `/${room._id}`;
    link.innerText = 'Join';
    link.innerHTML += `<i class="bi bi-arrow-right"></i>`
    div.classList.add('text-second');
    link.classList.add('btn','btn-prime');
    container.classList.add('d-flex','justify-content-between','align-items-center','pt-2','pb-2','border-top','border-second');
    container.append(div);
    container.append(link);
    roomContainer.append(container);
    roomInput.value = '';
}

const showMessage = (message, username, time) => {
    const messageContainer = document.createElement('div');
    const messageText = document.createElement('b');
    const div = document.createElement('div');
    messageText.innerText = message;
    const timeText = document.createElement('p');
    timeText.innerText = time;
    const nameText = document.createElement('p');
    nameText.innerText = username;
    div.append(nameText);
    div.append(timeText);
    messageContainer.append(div);
    messageContainer.append(messageText);
    messageContainer.classList.add('message');
    messagesContainer.append(messageContainer);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    const audio = new Audio('./audio/bell-sound.wav');
    audio.play();
}

const updateRoomUsers = (users) => {
    usersContainer.innerHTML = '';
    users.forEach( user => {
        const userContainer = document.createElement('div');
        userContainer.innerHTML += `<i class="bi bi-dot text-green"></i>`;
        const userNameText = document.createElement('span');
        userNameText.classList.add('text-second');
        userNameText.innerText = `${user.name}`;
        userContainer.append(userNameText);
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

