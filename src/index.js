import cors from "cors";
import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";

let onlineUsers = [];
const app = express();

app.use(express.json());
app.use(cors());

app.get("/online-users", (req, res) => {
  res.send(onlineUsers);
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  /* options */
});

io.on("connection", (socket) => {
  console.log("🔃 socketId on connection: ", socket.id);
  console.log(socket.handshake.auth);

  socket.emit("welcome");

  socket.on("setUsername", ({ username }) => {
    console.log(username);

    onlineUsers.push({ username, socketId: socket.id });

    // How to emit an event to every other client socket
    socket.broadcast.emit("userJoined");

    socket.emit("didLogin");
  });

  socket.on("outgoingMessage", ({ message }) => {
    console.log(message);

    if (message.recipient) {
      socket.to(message.recipient).emit("incomingMessage", { message });
    } else {
      socket.broadcast.emit("incomingMessage", { message });
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ Closed connection `); // -->> this is breaking the code, probably because the connection with that id doesn't exist at this point already with socketId: ${user.socketId}
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
  });
});

httpServer.listen(3030, () => {
  console.log("listening on port 3030");
});
