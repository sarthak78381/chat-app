const generateMessage = (message) => {
    return {
        ...message,
        createdAt: new Date().getTime(),
        type: "p"
    }
}

const generateMessageForLocation = (url) => {
    return {
        ...url,
        createdAt: new Date().getTime(),
        type: "a",
        message: "User Location"
    }
}

const generateMessageForUser = (users) => {
    return users
}

module.exports = {
    generateMessage, 
    generateMessageForLocation,
    generateMessageForUser
}