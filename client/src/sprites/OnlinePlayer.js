import Phaser from "phaser";
import { getCharacterName } from "../utils/string";

export default class OnlinePlayer extends Phaser.GameObjects.Sprite {
  constructor({ scene, x, y, character, direction }) {
    super(scene, x, y, "placeholderSpritesheet");

    this.character = character;

    this.setScale(2);

    this.scene.add.existing(this);
    this.scene.physics.world.enableBody(this);
    this.scene.load.spritesheet(
      this.character,
      `src/assets/spritesheets/humbits/${this.character}.png`,
      {
        frameWidth: 24,
        frameHeight: 24,
      }
    );
    this.scene.load.once(Phaser.Loader.Events.COMPLETE, () => {
      this.scene.anims.create({
        key: `${this.character}-walk`,
        frames: this.scene.anims.generateFrameNumbers(this.character, {
          frames: [1, 2, 3, 4],
        }),
        frameRate: 10,
        repeat: -1,
      });
      this.setTexture(this.character);
    });
    this.scene.load.start();

    if (direction === "left") {
      this.setFlipX(true);
    } else if (direction === "right") {
      this.setFlipX(false);
    }

    // Display character name above player
    this.playerNickname = this.scene.add
      .text(0, 0, getCharacterName(this.character))
      .setDepth(2);
    this.playerNickname.setPosition(
      this.x - this.playerNickname.width / 2,
      this.y - this.playerNickname.height / 2 - 24
    );
  }

  startWalking(x, y, direction) {
    this.anims.play(`${this.texture.key}-walk`, true);
    if (direction === "left") {
      this.setFlipX(true);
    } else if (direction === "right") {
      this.setFlipX(false);
    }
    this.setPosition(x, y);
    this.playerNickname.setPosition(
      this.x - this.playerNickname.width / 2,
      this.y - this.playerNickname.height / 2 - 24
    );
  }

  stopWalking() {
    this.anims.stop();
    this.setFrame(0);
  }

  destroy() {
    super.destroy();
    this.playerNickname.destroy();
  }
}
