const fs = require("fs");
const httpServer = require("https").createServer({
  key: fs.readFileSync("tls/api_zombits_io.key"),
  cert: fs.readFileSync("tls/api_zombits_io.crt"),
  ca: fs.readFileSync("tls/api_zombits_io.ca-bundle"),
});
const io = require("socket.io")(httpServer, {
  cors: { origin: "https://play.zombits.io" },
);

// Dictionary of players currently connected to the server
const players = {};

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () =>
  console.log(`Listening on ws://localhost:${PORT}`)
);

io.on("connection", (socket) => handleConnection(socket));

// Handle client connection
const handleConnection = (socket) => {
  console.log("New socket connection...", { socketId: socket.id });

  socket.on("playerJoined", (playerInfo) =>
    handlePlayerJoin(socket, playerInfo)
  );
  socket.on("playerMoved", (position) => handlePlayerMove(socket, position));
  socket.on("playerStopped", () => handlePlayerStop(socket));
  socket.on("playerChat", (chat) => handlePlayerChat(socket, chat));
  socket.on("disconnect", (reason) => handlePlayerLeave(socket, reason));
};

// Handle player joining
const handlePlayerJoin = (socket, { character, x, y }) => {
  // If same character is joined, disconnect them
  const sameJoinedCharacter = Object.keys(players).find(
    (socketId) => players[socketId].character === character
  );
  if (sameJoinedCharacter) {
    const alreadyJoinedClient = io.sockets.sockets.get(sameJoinedCharacter);
    alreadyJoinedClient.disconnect();
  }

  const newPlayer = {
    socketId: socket.id,
    x,
    y,
    direction: "right",
    character,
  };
  socket.emit("currentPlayers", players);
  players[newPlayer.socketId] = newPlayer;
  console.log("Player joined...", {
    socketId: newPlayer.socketId,
    character: newPlayer.character,
    onlinePlayers: Object.keys(players).length,
  });
  socket.broadcast.emit("playerJoined", newPlayer);
};

// Handle player leaving
const handlePlayerLeave = (socket, reason) => {
  console.log("Player left (socket closed)...", {
    socketId: socket.id,
    character: players[socket.id] && players[socket.id].character,
    reason,
    onlinePlayers: Object.keys(players).length - 1,
  });
  socket.broadcast.emit("playerLeft", socket.id);
  delete players[socket.id];
};

// Handle player moved
const handlePlayerMove = (socket, { x, y, direction }) => {
  players[socket.id].x = x;
  players[socket.id].y = y;
  players[socket.id].direction = direction;

  socket.broadcast.emit("playerMoved", socket.id, { x, y, direction });
};

// Handle player stopped moving
const handlePlayerStop = (socket) => {
  socket.broadcast.emit("playerStopped", socket.id);
};

// Handle player chat
const handlePlayerChat = (socket, { character, message }) => {
  const connectedPlayer = players[socket.id];
  const chatMessage = message.trim();
  if (
    connectedPlayer &&
    connectedPlayer.character === character &&
    chatMessage !== "" &&
    chatMessage.length < 257
  ) {
    console.log("New chat message to broadcast...", {
      socketId: socket.id,
      character,
      message: chatMessage,
    });
    io.emit("playerChat", { character, message: chatMessage });
  } else {
    console.log("Invalid message to broadcast...", {
      socketId: socket.id,
      character,
      connectedPlayer,
      message: chatMessage,
    });
  }
};
