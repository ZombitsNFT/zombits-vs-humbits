import Phaser from "phaser";

import socket from "./SocketClient";
import Player from "./Player";
import OnlinePlayer from "./OnlinePlayer";

const onlinePlayers = [];

let cursors, socketKey;

export class PlayGame extends Phaser.Scene {
  constructor() {
    super("playGame");
  }

  init(data) {
    // Map data
    this.mapName = data.map;

    // Player Texture starter position
    this.playerTexturePosition = data.playerTexturePosition;

    // Set container
    this.container = [];
  }

  create() {
    socket.emit("join");
    socket.on("CURRENT_PLAYERS", (players) => {
      Object.keys(players).forEach((playerId) => {
        let player = players[playerId];

        if (playerId !== socket.id) {
          // ??
          onlinePlayers[player.sessionId] = new OnlinePlayer({
            scene: this,
            playerId: player.sessionId,
            key: player.sessionId,
            map: player.map,
            x: player.x,
            y: player.y,
          });
        }
      });
    });
    socket.on("PLAYER_JOINED", (data) => {
      if (!onlinePlayers[data.sessionId]) {
        onlinePlayers[data.sessionId] = new OnlinePlayer({
          scene: this,
          playerId: data.sessionId,
          key: data.sessionId,
          map: data.map,
          x: data.x,
          y: data.y,
        });
      }
    });
    socket.on("PLAYER_LEFT", (data) => {
      if (onlinePlayers[data.sessionId]) {
        onlinePlayers[data.sessionId].destroy();
        delete onlinePlayers[data.sessionId];
      }
    });
    socket.on("PLAYER_MOVED", (data) => {
      // If player is in same map
      if (this.mapName === onlinePlayers[data.sessionId].map) {
        // If player isn't registered in this scene (map changing bug..)
        if (!onlinePlayers[data.sessionId].scene) {
          onlinePlayers[data.sessionId] = new OnlinePlayer({
            scene: this,
            playerId: data.sessionId,
            key: data.sessionId,
            map: data.map,
            x: data.x,
            y: data.y,
          });
        }
        // Start animation and set sprite position
        onlinePlayers[data.sessionId].isWalking(data.position, data.x, data.y);
      }
    });
    socket.on("PLAYER_MOVEMENT_ENDED", (data) => {
      // If player is in same map
      if (this.mapName === onlinePlayers[data.sessionId].map) {
        // If player isn't registered in this scene (map changing bug..)
        if (!onlinePlayers[data.sessionId].scene) {
          onlinePlayers[data.sessionId] = new OnlinePlayer({
            scene: this,
            playerId: data.sessionId,
            key: data.sessionId,
            map: data.map,
            x: data.x,
            y: data.y,
          });
        }
        // Stop animation & set sprite texture
        onlinePlayers[data.sessionId].stopWalking(data.position);
      }
    });
    socket.on("PLAYER_CHANGED_MAP", (data) => {
      if (onlinePlayers[data.sessionId]) {
        onlinePlayers[data.sessionId].destroy();

        if (data.map === this.mapName && !onlinePlayers[data.sessionId].scene) {
          onlinePlayers[data.sessionId] = new OnlinePlayer({
            scene: this,
            playerId: data.sessionId,
            key: data.sessionId,
            map: data.map,
            x: data.x,
            y: data.y,
          });
        }
      }
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
      key: "player",
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

    this.movementTimer();
  }

  update(time, delta) {
    // Loop the player update method
    this.player.update(time, delta);

    // console.log('PlayerX: ' + this.player.x);
    // console.log('PlayerY: ' + this.player.y);

    // Horizontal movement
    if (cursors.left.isDown) {
      if (socketKey) {
        if (this.player.isMoved()) {
          socket.emit("PLAYER_MOVED", {
            position: "left",
            x: this.player.x,
            y: this.player.y,
          });
        }
        socketKey = false;
      }
    } else if (cursors.right.isDown) {
      if (socketKey) {
        if (this.player.isMoved()) {
          socket.emit("PLAYER_MOVED", {
            position: "right",
            x: this.player.x,
            y: this.player.y,
          });
        }
        socketKey = false;
      }
    }

    // Vertical movement
    if (cursors.up.isDown) {
      if (socketKey) {
        if (this.player.isMoved()) {
          socket.emit("PLAYER_MOVED", {
            position: "back",
            x: this.player.x,
            y: this.player.y,
          });
        }
        socketKey = false;
      }
    } else if (cursors.down.isDown) {
      if (socketKey) {
        if (this.player.isMoved()) {
          socket.emit("PLAYER_MOVED", {
            position: "front",
            x: this.player.x,
            y: this.player.y,
          });
        }
        socketKey = false;
      }
    }

    // Horizontal movement ended
    if (Phaser.Input.Keyboard.JustUp(cursors.left) === true) {
      socket.emit("PLAYER_MOVEMENT_ENDED", {
        position: "left",
      });
    } else if (Phaser.Input.Keyboard.JustUp(cursors.right) === true) {
      socket.emit("PLAYER_MOVEMENT_ENDED", {
        position: "right",
      });
    }

    // Vertical movement ended
    if (Phaser.Input.Keyboard.JustUp(cursors.up) === true) {
      socket.emit("PLAYER_MOVEMENT_ENDED", {
        position: "back",
      });
    } else if (Phaser.Input.Keyboard.JustUp(cursors.down) === true) {
      socket.emit("PLAYER_MOVEMENT_ENDED", {
        position: "front",
      });
    }
  }

  movementTimer() {
    setInterval(() => {
      socketKey = true;
    }, 50);
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
