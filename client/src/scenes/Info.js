import Phaser from "phaser";

import { addProgressBar, updateObjectPosition } from "../utils/scene";

export default class Info extends Phaser.Scene {
  constructor() {
    super("info");
  }

  init({ message }) {
    this.message = message;
  }

  preload() {
    addProgressBar(this);

    this.load.image("okButton", "src/assets/images/ok-button.png");
    this.load.image(
      "okButtonPressed",
      "src/assets/images/ok-button-pressed.png"
    );
  }

  async create() {
    this.messageLabel = this.add
      .text(0, 0, this.message, { fontSize: 32 })
      .setOrigin()
      .setWordWrapWidth(640);

    this.okButtonImage = this.add
      .image(0, 0, "okButton")
      .setScale(2)
      .setInteractive({ useHandCursor: true })
      .on(Phaser.Input.Events.POINTER_OVER, () => {
        this.okButtonImage.setTexture("okButtonPressed");
      })
      .on(Phaser.Input.Events.POINTER_OUT, () =>
        this.okButtonImage.setTexture("okButton")
      )
      .on(Phaser.Input.Events.POINTER_UP, () => {
        this.scene.start("mainMenu");
      });
  }

  update() {
    updateObjectPosition(
      this.messageLabel,
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 50
    );
    updateObjectPosition(
      this.okButtonImage,
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 50
    );
  }
}
