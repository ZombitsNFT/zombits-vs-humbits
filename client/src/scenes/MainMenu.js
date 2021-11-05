import Phaser from "phaser";
import { addProgressBar, updateObjectPosition } from "../utils/scene";
import { getCharacterName } from "../utils/string";

export default class MainMenu extends Phaser.Scene {
  constructor() {
    super("mainMenu");
  }

  init() {
    this.chosenCharacter = this.registry.get("chosenCharacter");
  }

  preload() {
    addProgressBar(this);

    this.load.image(
      "adventureButton",
      "src/assets/images/adventure-button.png"
    );
    this.load.image(
      "adventureButtonPressed",
      "src/assets/images/adventure-button-pressed.png"
    );
    this.load.image("arenaButton", "src/assets/images/arena-button.png");
    this.load.image("changeButton", "src/assets/images/change-button.png");
    this.load.image(
      "changeButtonPressed",
      "src/assets/images/change-button-pressed.png"
    );
  }

  create() {
    this.cloudsImage = this.add.image(0, 0, "clouds").setScale(10);

    this.zombitsVsHumbitsLogoImage = this.add
      .image(0, 0, "zombitsVsHumbitsLogo")
      .setScale(1.5);

    this.chosenCharacterImage = this.add
      .image(0, 0, this.chosenCharacter)
      .setScale(12);

    this.chosenCharacterText = this.add
      .text(0, 0, getCharacterName(this.chosenCharacter), { fontSize: 32 })
      .setOrigin();

    this.adventureButtonImage = this.add
      .image(0, 0, "adventureButton")
      .setScale(2)
      .setInteractive({ useHandCursor: true })
      .on(Phaser.Input.Events.POINTER_OVER, () => {
        this.adventureButtonImage.setTexture("adventureButtonPressed");
      })
      .on(Phaser.Input.Events.POINTER_OUT, () =>
        this.adventureButtonImage.setTexture("adventureButton")
      )
      .on(Phaser.Input.Events.POINTER_UP, () => {
        this.scene.start("adventure");
      });

    this.arenaButtonImage = this.add.image(0, 0, "arenaButton").setScale(2);

    this.changeButtonImage = this.add
      .image(0, 0, "changeButton")
      .setScale(1)
      .setInteractive({ useHandCursor: true })
      .on(Phaser.Input.Events.POINTER_OVER, () => {
        this.changeButtonImage.setTexture("changeButtonPressed");
      })
      .on(Phaser.Input.Events.POINTER_OUT, () =>
        this.changeButtonImage.setTexture("changeButton")
      )
      .on(Phaser.Input.Events.POINTER_UP, () => {
        this.scene.start("chooseCharacter");
      });
  }

  update() {
    updateObjectPosition(
      this.cloudsImage,
      this.cameras.main.width / 2,
      this.cameras.main.height / 2
    );
    updateObjectPosition(
      this.zombitsVsHumbitsLogoImage,
      this.cameras.main.width / 2 + 200,
      this.cameras.main.height / 2 - 100
    );
    updateObjectPosition(
      this.chosenCharacterImage,
      this.cameras.main.width / 2 - 200,
      this.cameras.main.height / 2 - 50
    );
    updateObjectPosition(
      this.chosenCharacterText,
      this.cameras.main.width / 2 - 200,
      this.cameras.main.height / 2 + 120
    );
    updateObjectPosition(
      this.changeButtonImage,
      this.cameras.main.width / 2 - 200,
      this.cameras.main.height / 2 + 150
    );
    updateObjectPosition(
      this.adventureButtonImage,
      this.cameras.main.width / 2 + 200,
      this.cameras.main.height / 2
    );
    updateObjectPosition(
      this.arenaButtonImage,
      this.cameras.main.width / 2 + 200,
      this.cameras.main.height / 2 + 75
    );
  }
}
