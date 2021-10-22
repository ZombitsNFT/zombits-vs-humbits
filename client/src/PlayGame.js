import Phaser from "phaser";

import OnlinePlayer from "./OnlinePlayer";
import Player from "./Player";
import socket from "./SocketClient";

var onlinePlayers = {};

let cursors;

export class PlayGame extends Phaser.Scene {
  constructor() {
    super("playGame");
  }

  init(data) {
    // Map data
    this.mapName = data.map;

    // Player Texture starter direction
    this.playerTextureDirection = data.playerTextureDirection;

    // Set container
    this.container = [];
  }

  create() {
    socket.connect();
    socket.on("disconnect", () => {
      console.log("Disconnected.");
      // TODO: move same logic below to "currentPlayers" below?
      Object.keys(onlinePlayers).forEach((socketId) => {
        console.log(`Player ${socketId} left.`);
        onlinePlayers[socketId].destroy();
        delete onlinePlayers[socketId];
      });
    });
    socket.on("currentPlayers", (players) => {
      Object.values(players).forEach((player) => {
        onlinePlayers[player.socketId] = new OnlinePlayer({
          scene: this,
          ...player,
        });
      });
      console.log(
        `${Object.keys(onlinePlayers).length} players online:`,
        onlinePlayers
      );
    });
    socket.on("playerJoined", (newPlayer) => {
      console.log(`Player ${newPlayer.socketId} joined.`);
      onlinePlayers[newPlayer.socketId] = new OnlinePlayer({
        scene: this,
        ...newPlayer,
      });
    });
    socket.on("playerLeft", (player) => {
      console.log(`Player ${player.socketId} left.`);
      onlinePlayers[player.socketId].destroy();
      delete onlinePlayers[player.socketId];
    });
    socket.on("playerMoved", (socketId, position) => {
      // Start animation and set sprite position
      onlinePlayers[socketId].isWalking(
        position.direction,
        position.x,
        position.y
      );
    });
    socket.on("playerStopped", (socketId, direction) => {
      // Stop animation & set sprite texture
      onlinePlayers[socketId].stopWalking(direction);
    });

    this.map = this.make.tilemap({ key: this.mapName });

    // Set current map Bounds
    this.scene.scene.physics.world.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );

    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    const tileset = this.map.addTilesetImage(
      "tuxmon-sample-32px-extruded",
      "TilesTown"
    );

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    this.belowLayer = this.map.createStaticLayer("Below Player", tileset, 0, 0);
    this.worldLayer = this.map.createStaticLayer("World", tileset, 0, 0);
    this.grassLayer = this.map.createStaticLayer("Grass", tileset, 0, 0);
    this.aboveLayer = this.map.createStaticLayer("Above Player", tileset, 0, 0);

    this.worldLayer.setCollisionByProperty({ collides: true });

    // By default, everything gets depth sorted on the screen in the order we created things. Here, we
    // want the "Above Player" layer to sit on top of the player, so we explicitly give it a depth.
    // Higher depths will sit on top of lower depth objects.
    this.aboveLayer.setDepth(10);

    // Get spawn point from tiled map
    const spawnPoint = this.map.findObject(
      "SpawnPoints",
      (obj) => obj.name === "Spawn Point"
    );

    // Set player
    this.player = new Player({
      scene: this,
      worldLayer: this.worldLayer,
      socketId: "player",
      x: spawnPoint.x,
      y: spawnPoint.y,
    });

    const camera = this.cameras.main;
    camera.startFollow(this.player);
    camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    cursors = this.input.keyboard.createCursorKeys();

    // Help text that has a "fixed" position on the screen
    this.add
      .text(16, 16, 'Arrow keys to move\nPress "D" to show hitboxes', {
        font: "18px monospace",
        fill: "#000000",
        padding: { x: 20, y: 10 },
        backgroundColor: "#ffffff",
      })
      .setScrollFactor(0)
      .setDepth(30);

    this.debugGraphics();
  }

  update(time, delta) {
    // Loop the player update method
    this.player.update(time, delta);

    // console.log('PlayerX: ' + this.player.x);
    // console.log('PlayerY: ' + this.player.y);

    // Horizontal movement
    if (cursors.left.isDown) {
      if (this.player.isMoved()) {
        socket.emit("playerMoved", {
          direction: "left",
          x: this.player.x,
          y: this.player.y,
        });
      }
    } else if (cursors.right.isDown) {
      if (this.player.isMoved()) {
        socket.emit("playerMoved", {
          direction: "right",
          x: this.player.x,
          y: this.player.y,
        });
      }
    }

    // Vertical movement
    if (cursors.up.isDown) {
      if (this.player.isMoved()) {
        socket.emit("playerMoved", {
          direction: "back",
          x: this.player.x,
          y: this.player.y,
        });
      }
    } else if (cursors.down.isDown) {
      if (this.player.isMoved()) {
        socket.emit("playerMoved", {
          direction: "front",
          x: this.player.x,
          y: this.player.y,
        });
      }
    }

    // Horizontal movement ended
    if (Phaser.Input.Keyboard.JustUp(cursors.left) === true) {
      socket.emit("playerStopped", "left");
    } else if (Phaser.Input.Keyboard.JustUp(cursors.right) === true) {
      socket.emit("playerStopped", "right");
    }

    // Vertical movement ended
    if (Phaser.Input.Keyboard.JustUp(cursors.up) === true) {
      socket.emit("playerStopped", "back");
    } else if (Phaser.Input.Keyboard.JustUp(cursors.down) === true) {
      socket.emit("playerStopped", "front");
    }
  }

  debugGraphics() {
    // Debug graphics
    this.input.keyboard.once("keydown_D", (event) => {
      // Turn on physics debugging to show player's hitbox
      this.physics.world.createDebugGraphic();

      // Create worldLayer collision graphic above the player, but below the help text
      const graphics = this.add.graphics().setAlpha(0.75).setDepth(20);
      this.worldLayer.renderDebug(graphics, {
        tileColor: null, // Color of non-colliding tiles
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
        faceColor: new Phaser.Display.Color(40, 39, 37, 255), // Color of colliding face edges
      });
    });
  }
}
