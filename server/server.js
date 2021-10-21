const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: { origin: "http://localhost:8081", credentials: true },
  pingTimeout: 60000,
});

const port = process.env.PORT || 3000;
const players = {};

io.on("connection", (socket) => {
  socket.on("join", () => {
    console.log(
      `${socket.id} joined... ${
        Object.keys(players).length
      } other players in game`
    );

    socket.emit("CURRENT_PLAYERS", players);

    players[socket.id] = {
      sessionId: socket.id,
      map: "town",
      x: 352, // TODO: initial starting position of player sent to server. try to sync up with clients coords
      y: 1216,
    };

    socket.broadcast.emit("PLAYER_JOINED", players[socket.id]);
  });

  socket.on("PLAYER_MOVED", (movement) => {
    players[socket.id].x = movement.x;
    players[socket.id].y = movement.y;

    socket.broadcast.emit("PLAYER_MOVED", {
      ...players[socket.id],
      position: movement.position,
    });
  });
  socket.on("PLAYER_MOVEMENT_ENDED", (movement) => {
    socket.broadcast.emit("PLAYER_MOVEMENT_ENDED", {
      sessionId: socket.id,
      map: players[socket.id].map,
      position: movement.position,
    });
  });

  socket.on("disconnect", (reason) => {
    console.log(`${socket.id} left... ${reason}`);
    socket.broadcast.emit("PLAYER_LEFT", players[socket.id]);
    delete players[socket.id];
  });
});

httpServer.listen(port, () =>
  console.log(`Listening on ws://localhost:${port}`)
);
