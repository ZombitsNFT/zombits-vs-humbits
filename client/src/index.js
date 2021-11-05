import Phaser from "phaser";

import ChooseCharacter from "./scenes/ChooseCharacter";
import ConnectWallet from "./scenes/ConnectWallet";
import Info from "./scenes/Info";
import MainMenu from "./scenes/MainMenu";
import Adventure from "./scenes/Adventure";

const config = {
  type: Phaser.AUTO,
  parent: "zombits-vs-humbits-container",
  pixelArt: true,
  title: "Zombits VS Humbits",
  url: "https://play.zombits.io",
  version: "0.1",
  scale: {
    mode: Phaser.Scale.RESIZE,
  },
  disableContextMenu: true,
  backgroundColor: "#4eadf5",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
    },
  },
  audio: { noAudio: true },
  dom: {
    createContainer: true,
  },
  scene: [ConnectWallet, ChooseCharacter, MainMenu, Adventure, Info],
};

export default new Phaser.Game(config);
