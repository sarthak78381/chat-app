const rooms = {};
const usersId = {};

const addUser = ({id, userName: username, room: roomname}) => {
    let userName = username.trim().toLowerCase();
    let room = roomname.trim().toLowerCase();

    if (!room || !userName) {
        return {
            error: "User Name and Room are required"
        }
    }

    if (!rooms[room]) {
        const user = {id, userName};
        usersId[id] = room;
        rooms[room] = [
            {...user}
        ]
        return {user: {
            ...user,
            room
        }}
    }

    const existing = rooms[room].find((user) => user.userName === userName);
    
    if (existing) {
        return {
            error: "UserName Already in use"
        }
    }

    const user = {id, userName};
    usersId[id] = room;
    rooms[room].push(user);

    return {user: {
        ...user,
        room
    }};
};

const getUserRoom = (id) => {
    return usersId[id];
}

const getIndexOfUser = (id) => {
    const room = getUserRoom(id);
    if (!room) return {
        error: "invalid Id"
    }
    return {index:  rooms[room].findIndex(user => user.id === id), room};
}



const getUser = (id) => {
    let {index, room, error} = getIndexOfUser(id);

    if (error) {
        return {error};
    }
    
    if (index === -1) {
        return {
            error: "Invalid data"
        }
    }
    
    let user = rooms[room][index];
    return {user: {
        ...user,
        room
    }}
}

const removeUser = (id) => {
    let {index, room, error} = getIndexOfUser(id);

    if (error) {
        return {error};
    }
    
    if (index === -1) {
        return {
            error: "Invalid data"
        }
    }

    let user = rooms[room][index];
    user = {
        ...user,
        room
    }
    rooms[room].splice(index, 1);
    delete usersId[id]
    return {user}
    
}

const getRoomUsersList = (roomname) => {
    let room = roomname.trim().toLowerCase();
    return rooms[room]; 
}

// addUser({
//     id: 1,
//     userName: "sarthak",
//     room: "gupta"
// })
// addUser({
//     id: 2,
//     userName: "mayank",
//     room: "guptaa"
// })
// addUser({
//     id: 3,
//     userName: "maayank",
//     room: "guptaa"
// })
// removeUser(2);

// console.log(rooms, usersId);


module.exports = {
    getRoomUsersList, 
    getUser,
    removeUser,
    addUser
}