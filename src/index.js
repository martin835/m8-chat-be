import cors from "cors";
import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";

let onlineUsers = []
const app = express();

app.use(express.json())
app.use(cors())

app.get('/online-users', (req, res) => {
    res.send(onlineUsers);
})

const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });


io.on("connection", (socket) => {
    console.log(socket.id)
    console.log(socket.handshake.auth)

    socket.emit("welcome")

    socket.on("setUsername", ({ username }) => {
        console.log(username)

        onlineUsers.push({ username, socketId: socket.id })

        // How to emit an event to every other client socket
        socket.broadcast.emit("userJoined")

        socket.emit("didLogin")
    })

    socket.on("outgoingMessage", ({ message }) => {
        console.log(message)

        socket.broadcast.emit("incomingMessage", { message })
    })

    socket.on("disconnect", () => {
        onlineUsers = onlineUsers.filter(user => user.socketId !== socket.id)
    })
});

httpServer.listen(3030, () => {
    console.log("listening on port 3030");
});