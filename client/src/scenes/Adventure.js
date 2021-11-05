import InputText from "phaser3-rex-plugins/plugins/inputtext";
import io, { Socket } from "socket.io-client";
import Phaser from "phaser";

import OnlinePlayer from "../sprites/OnlinePlayer";
import Player from "../sprites/Player";
import { updateObjectPosition } from "../utils/scene";
import { getCharacterName, isHumbitName, isZombitName } from "../utils/string";

export default class Adventure extends Phaser.Scene {
  constructor() {
    super("adventure");
  }

  init() {
    this.chosenCharacter = this.registry.get("chosenCharacter");
    this.socket = io("ws://localhost:3000");

    this.onlinePlayers = {};
    this.chatMessages = [];

    this.chatWindow = this.add
      .text(0, 0, "", {
        backgroundColor: "#00000099",
        fixedWidth: 256,
        wordWrap: { width: 256, useAdvancedWrap: true },
      })
      .setScrollFactor(0)
      .setDepth(3)
      .setOrigin(0, 1);
    this.onlinePlayerWindow = this.add
      .text(0, 0, "", {
        backgroundColor: "#00000099",
        fixedWidth: 256,
      })
      .setScrollFactor(0)
      .setDepth(3)
      .setOrigin(1);

    this.isChatting = false;
  }

  preload() {
    this.load.image("homeButton", "src/assets/images/home-button.png");
    this.load.image(
      "homeButtonPressed",
      "src/assets/images/home-button-pressed.png"
    );
  }

  create() {
    // TODO: change depending on zombit/humbit
    const x = 100;
    const y = 400;

    this.map = this.make.tilemap({ key: "mapTilemap" });

    this.scene.scene.physics.world.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );

    const tileset = this.map.addTilesetImage("map", "mapTileset");

    this.map.createLayer("ground", tileset, 0, 0);
    const collider = this.map
      .createLayer("stuff", tileset, 0, 0)
      .setCollisionByProperty({ collides: true });
    this.map.createLayer("overlap", tileset, 0, 0).setDepth(1);

    this.currentPlayer = new Player({
      scene: this,
      x,
      y,
      character: this.chosenCharacter,
      collider,
    });

    this.cameras.main.startFollow(this.currentPlayer);
    this.cameras.main.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );

    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.removeCapture(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.zombitsVsHumbitsLogoImage = this.add
      .image(0, 0, "zombitsVsHumbitsLogo")
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(3);

    this.homeButtonImage = this.add
      .image(0, 0, "homeButton")
      .setScrollFactor(0)
      .setDepth(3)
      .setInteractive({ useHandCursor: true })
      .on(Phaser.Input.Events.POINTER_OVER, () => {
        this.homeButtonImage.setTexture("homeButtonPressed");
      })
      .on(Phaser.Input.Events.POINTER_OUT, () =>
        this.homeButtonImage.setTexture("homeButton")
      )
      .on(Phaser.Input.Events.POINTER_UP, () => {
        this.scene.start("mainMenu");
        this.socket.disconnect();
      });

    const chatInput = new InputText(this, 0, 0, 256, 32, {
      placeholder: "Chat",
      color: "#ffffff",
      backgroundColor: "#00000099",
      maxLength: 256,
      fontFamily: "courier",
    }).setScrollFactor(0);
    this.chatInput = this.add.existing(chatInput);

    this.input.on(Phaser.Input.Events.POINTER_UP, () => {
      this.chatInput.setBlur();
    });

    this.chatInput.on("blur", () => {
      this.isChatting = false;
    });
    this.chatInput.on("focus", () => {
      this.isChatting = true;
    });

    this.input.keyboard.on("keydown-ENTER", () => {
      const message = this.chatInput.text.trim();
      if (this.isChatting && message !== "") {
        console.log(`SENT: "${message}"`);
        this.socket.emit("playerChat", {
          character: this.chosenCharacter,
          message,
        });
        this.chatInput.setText("");
      }
    });

    /* Sockets */

    this.socket.emit("playerJoined", { character: this.chosenCharacter, x, y });
    this.socket.on("disconnect", (reason) => {
      console.log("Disconnected.", reason);
      if (reason === "transport close") {
        this.socket.disconnect();
        this.scene.start("info", { message: "Disconnected from server." });
      }
    });
    this.socket.on("connect_error", (err) => {
      console.log("Error connectiong...");
      this.socket.disconnect();
      this.scene.start("info", { message: "Couldn't connect to server." });
    });
    this.socket.on("currentPlayers", (players) => {
      Object.values(players).forEach(
        ({ socketId, x, y, direction, character }) => {
          this.onlinePlayers[socketId] = new OnlinePlayer({
            scene: this,
            x,
            y,
            direction,
            character,
          });
        }
      );
      this.onlinePlayerWindow.setText(
        `${this.getOnlineHumbitsCount(
          this.onlinePlayers
        )} other Humbits online.\n${this.getOnlineZombitsCount(
          this.onlinePlayers
        )} other Zombits online.`
      );
      console.log(
        `${Object.keys(this.onlinePlayers).length} players online:`,
        this.onlinePlayers
      );
    });
    this.socket.on(
      "playerJoined",
      ({ socketId, x, y, direction, character }) => {
        this.addChatMessage(`${getCharacterName(character)} joined.`);
        this.onlinePlayers[socketId] = new OnlinePlayer({
          scene: this,
          x,
          y,
          direction,
          character,
        });
        this.onlinePlayerWindow.setText(
          `${this.getOnlineHumbitsCount(
            this.onlinePlayers
          )} other Humbits online.\n${this.getOnlineZombitsCount(
            this.onlinePlayers
          )} other Zombits online.`
        );
      }
    );
    this.socket.on("playerLeft", (socketId) => {
      this.addChatMessage(
        `${getCharacterName(this.onlinePlayers[socketId].character)} left.`
      );
      this.onlinePlayers[socketId].destroy();
      delete this.onlinePlayers[socketId];
      this.onlinePlayerWindow.setText(
        `${this.getOnlineHumbitsCount(
          this.onlinePlayers
        )} other Humbits online.\n${this.getOnlineZombitsCount(
          this.onlinePlayers
        )} other Zombits online.`
      );
    });
    this.socket.on("playerMoved", (socketId, { x, y, direction }) => {
      this.onlinePlayers[socketId].startWalking(x, y, direction);
    });
    this.socket.on("playerStopped", (socketId) => {
      this.onlinePlayers[socketId].stopWalking();
    });
    this.socket.on("playerChat", ({ character, message }) => {
      console.log(`${character}: ${message}`);
      this.addChatMessage(`${getCharacterName(character)}: ${message}`);
    });
  }

  getOnlineHumbitsCount(onlinePlayers) {
    return Object.keys(onlinePlayers).filter((socketId) =>
      isHumbitName(onlinePlayers[socketId].character)
    ).length;
  }

  getOnlineZombitsCount(onlinePlayers) {
    return Object.keys(onlinePlayers).filter((socketId) =>
      isZombitName(onlinePlayers[socketId].character)
    ).length;
  }

  addChatMessage(message) {
    this.chatMessages.push(message);
    if (this.chatMessages.length > 128) {
      this.chatMessages.shift();
    }
    this.chatWindow.setText(this.chatMessages.join("\n"));
  }

  update(time, delta) {
    this.currentPlayer.update(time, delta);

    if (
      this.cursors.left.isDown ||
      this.cursors.right.isDown ||
      this.cursors.up.isDown ||
      this.cursors.down.isDown
    ) {
      this.socket.emit("playerMoved", {
        direction: this.currentPlayer.getDirection(),
        x: this.currentPlayer.x,
        y: this.currentPlayer.y,
      });
    }
    if (
      Phaser.Input.Keyboard.JustUp(this.cursors.left) ||
      Phaser.Input.Keyboard.JustUp(this.cursors.right) ||
      Phaser.Input.Keyboard.JustUp(this.cursors.up) ||
      Phaser.Input.Keyboard.JustUp(this.cursors.down)
    ) {
      this.socket.emit("playerStopped");
    }

    updateObjectPosition(
      this.zombitsVsHumbitsLogoImage,
      this.cameras.main.width - 16,
      8
    );

    updateObjectPosition(
      this.homeButtonImage,
      this.cameras.main.width - this.zombitsVsHumbitsLogoImage.width / 2 - 16,
      100
    );

    updateObjectPosition(this.chatWindow, 4, this.cameras.main.height - 40);
    updateObjectPosition(
      this.onlinePlayerWindow,
      this.cameras.main.width - 4,
      this.cameras.main.height - 4
    );
    updateObjectPosition(this.chatInput, 132, this.cameras.main.height - 20);
  }
}
