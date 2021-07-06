const express = require('express');
const {generateMessage, generateMessageForLocation} = require('./utils/message');
const {addUser, removeUser, getUser, getRoomUsersList} = require('./utils/users');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.port || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');
 

io.on('connection', (socket) => {

    socket.on('join', async ({userName, room}, callBack) => {
        const {error, user} = addUser({userName, room, id: socket.id});
        
        if (error) return callBack(error);
        
        await socket.join(user.room);

        socket.broadcast.to(user.room).emit('alert', `${user.userName} Joined`)
        io.to(user.room).emit('userList', getRoomUsersList(user.room));
        callBack();
    })

    socket.on('sendMessage', (message, callBack) => {
        
        if (!message) return callBack('error');
        
        const {error, user} = getUser(socket.id);
        if (error) return callBack(error);
        
        socket.broadcast.to(user.room).emit('message', generateMessage({
            message,
            userName: user.userName
        }))
        return callBack();
    })
    
    socket.on('sendingLocation', ({lat, long}, callBack) => {
        
        if (!lat || !long) return callback('error');

        const {error, user} = getUser(socket.id);
        if (error) return callBack(error);

        let message = `https://www.google.com/maps?q=${lat},${long}`;
        socket.broadcast.to(user.room).emit('locationMessage', generateMessageForLocation({
            url: message,
            userName: user.userName
        }));
        callBack();
    })

    socket.on('disconnect', () => {
        let {error, user} = removeUser(socket.id);
        if (error) return io.emit('error', error);
        socket.broadcast.to(user.room).emit('alert', `${user.userName} Exited`)
        io.to(user.room).emit('userList', getRoomUsersList(user.room));
    })
})



app.use(express.static(publicDirectoryPath))

server.listen(port, () => {
    console.log(`server is running on port: ${port}`)
})