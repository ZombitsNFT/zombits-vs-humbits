const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: { origin: "http://localhost:8081", credentials: true },
  pingTimeout: 60000,
});

const players = {};

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () =>
  console.log(`Listening on ws://localhost:${PORT}`)
);

io.on("connection", (socket) => handleConnection(socket));

const handleConnection = (socket) => {
  console.log(`New socket connection: ${socket.id}`);
  handlePlayerJoin(socket); // socket.on("playerJoined", () => handlePlayerJoin(socket));

  socket.on("playerMoved", (position) => handlePlayerMove(socket, position));
  socket.on("playerStopped", (direction) =>
    handlePlayerStop(socket, direction)
  );
  socket.on("disconnect", (reason) => handlePlayerLeave(socket, reason));
};

const handlePlayerJoin = (socket) => {
  const newPlayer = {
    socketId: socket.id,
    x: 352, // TODO: initial starting position of player sent to server. try to sync up with clients coords
    y: 1216,
  };
  console.log(
    `Player ${newPlayer.socketId} joined... ${
      Object.keys(players).length
    } other players in game.`
  );
  socket.emit("currentPlayers", players);
  players[newPlayer.socketId] = newPlayer;
  socket.broadcast.emit("playerJoined", newPlayer);
};

const handlePlayerLeave = (socket, reason) => {
  console.log(`Player ${socket.id} left... Reason: ${reason}.`);
  socket.broadcast.emit("playerLeft", players[socket.id]);
  delete players[socket.id];
};

const handlePlayerMove = (socket, position) => {
  players[socket.id].x = position.x;
  players[socket.id].y = position.y;

  socket.broadcast.emit("playerMoved", socket.id, {
    x: position.x,
    y: position.y,
    direction: position.direction,
  });
};

const handlePlayerStop = (socket, direction) => {
  socket.broadcast.emit("playerStopped", socket.id, direction);
};
