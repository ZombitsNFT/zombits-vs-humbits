import Phaser from "phaser";
import { Boot } from "./Boot";
import { PlayGame } from "./PlayGame";

const Config = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  parent: "game-container",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
    },
  },
  scene: [Boot, PlayGame],
};

export default new Phaser.Game(Config);
