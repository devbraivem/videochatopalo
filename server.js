const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const routerChat = require("./routes/videochat");
const routerBd = require("./routes/users");
const bodyParser = require("body-parser");
const pool = require("./db");
// Peer
const { ExpressPeerServer } = require("peer");
const { count } = require("console");
const peerServer = ExpressPeerServer(server, {
  debug: true,
});

//Settings
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", peerServer);
app.use(bodyParser.urlencoded({ extended: false }));
//Routes
app.use("/", routerChat);
app.use("/bd", routerBd);

let line_history = [];
let clients = 0;

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    console.log(clients);
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);

    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message);
      const room = roomId;
      const usuario = userId;
      const mensaje = message;
      console.log(mensaje);
      /* if ((message = null)) {
        console.log("aun no");
      } else {
        pool.query(
          `insert into chat(room, usuario, mensaje) values ($1,$2,$3)`,
          [room, usuario, mensaje]
        );
      } */
    });
  });

  for (let i in line_history) {
    socket.emit("draw_line", { line: line_history[i] });
  }
  socket.on("draw_line", (data) => {
    line_history.push(data.line);
    io.emit("draw_line", { line: data.line });
  });
});

const PORT = process.env.PORT || 9000;
server.listen(PORT, () => console.log(`Server on port ${PORT}`));
