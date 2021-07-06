const socket = io();

const { userName, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual'
}

socket.emit('join', { userName, room }, (error) => {
    if (error) return console.log(error);
    return console.log("successfully joined the room")
});

const messageForm = document.getElementById('message-form');
const messageFormButton = messageForm.querySelector("button");
const messageFormInput = messageForm.querySelector("input");
const locationButton = document.getElementById('location-button');
const messagesContainer = document.getElementById('messages__container');
const messages = document.getElementById('messages');
const usersList = document.getElementById('userList__container');
const messageTemplate = document.querySelector('#message-template').innerHTML;
const sideBarTemplate = document.querySelector('#sideBar-template').innerHTML;
const alertTemplate = document.querySelector('#alert-template').innerHTML;


const generateMessage = (messageObject) => {
    return {
        ...messageObject,
        createdAt: new Date().getTime(),
        type: "p"
    }
}

const generateMessageForLocation = (urlObject) => {
    return {
        ...urlObject,
        createdAt: new Date().getTime(),
        type: "a",
        message: "User Location"
    }
}


const createTemplateForMessage = (Template, messageObject) => {
    return Mustache.render(Template, {
        ...messageObject,
        createdAt: moment(messageObject.createdAt).format('h:mm a'),
    })
}

const autoScroll = () => {
    const newMessage = messages.lastElementChild;

    const newMessageStyles = getComputedStyle(newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

    const visibleHeight = messagesContainer.offsetHeight;

    const containerHeight = messagesContainer.scrollHeight;

    const scrollOffset = messagesContainer.scrollTop + visibleHeight

    
    if (containerHeight - newMessageHeight <= scrollOffset) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight
    }
}

function sendMessage(e) {
    e.preventDefault();
    messageFormButton.disabled = true;
    let message = messageFormInput.value;
    messageFormInput.value = '';
    if (!message) {
        return messageFormButton.disabled = false;
    }
    let html = createTemplateForMessage(messageTemplate, {
        ...generateMessage({message, userName}),
        userMessage: true,
    });
    messages.insertAdjacentHTML('beforeend', html);
    socket.emit('sendMessage', message, (error) => {
        if (error) {
            messageFormButton.disabled=false;
            return console.log('fail to send the message')
        };
        messageFormButton.disabled=false;
        messageFormInput.focus();
        autoScroll();
        return console.log('message send successfully');
    })
}

function sendLocation() {
    locationButton.disabled = true;
    navigator.geolocation.getCurrentPosition((location) => {
        if (!location) return console.log('unable to get location')
        let lat = location.coords.latitude, long = location.coords.longitude;
        let html = createTemplateForMessage(messageTemplate, {
            ...generateMessageForLocation({url: `https://www.google.com/maps?q=${lat},${long}`, userName}),
            userMessage: true,
        });
        messages.insertAdjacentHTML('beforeend', html);
        socket.emit('sendingLocation', {lat, long}, (error) => {
            if (error) return console.log('unable to send location');
            locationButton.disabled=false;
            autoScroll()
            console.log('location send successfully');
        });
    });
}

messageForm.addEventListener('submit', sendMessage); 
locationButton.addEventListener('click', sendLocation);

socket.on('userList', (userList) => {
    usersList.innerHTML = ''
    userList.map(users => {
        const html = createTemplateForMessage(sideBarTemplate, {userName: users.userName});
        return usersList.insertAdjacentHTML('beforeend', html);
    })
})


socket.on('alert', (message) => {
    const html = Mustache.render(alertTemplate, {message})
    messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
})


socket.on('message', (messageObject) => {
    const html = createTemplateForMessage(messageTemplate, messageObject);
    messages.insertAdjacentHTML('beforeend', html);
    autoScroll()
})

socket.on("locationMessage", (urlObject) => {
    const html = createTemplateForMessage(messageTemplate, urlObject)
    messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
})

socket.on('error', (error) => {
    console.log(error)
})