import Phaser from "phaser";

import {
  addProgressBar,
  updateCharactersPage,
  updateObjectPosition,
} from "../utils/scene";
import { getAssetNames } from "../utils/wallet";

export default class ChooseCharacter extends Phaser.Scene {
  constructor() {
    super("chooseCharacter");
  }

  init() {
    this.charactersPerPage = 4;

    this.humbitsPageIndex = 0;
    this.currentHumbits = [];

    this.zombitsPageIndex = 0;
    this.currentZombits = [];
  }

  preload() {
    addProgressBar(this);

    this.load.image("rightButton", "src/assets/images/right-button.png");
    this.load.image(
      "rightButtonPressed",
      "src/assets/images/right-button-pressed.png"
    );

    this.load.image("leftButton", "src/assets/images/left-button.png");
    this.load.image(
      "leftButtonPressed",
      "src/assets/images/left-button-pressed.png"
    );

    this.load.image(
      "leftButtonDisabled",
      "src/assets/images/left-button-disabled.png"
    );
    this.load.image(
      "rightButtonDisabled",
      "src/assets/images/right-button-disabled.png"
    );

    this.load.image("buyNowButton", "src/assets/images/buy-now-button.png");
    this.load.image(
      "buyNowButtonPressed",
      "src/assets/images/buy-now-button-pressed.png"
    );

    this.load.image("zombitsLogo", "src/assets/images/zombits-logo.png");
    this.load.image("humbitsLogo", "src/assets/images/humbits-logo.png");

    this.load.image("mapTileset", "src/assets/tilesets/map.png");
    this.load.tilemapTiledJSON("mapTilemap", "src/assets/tilemaps/map.json");

    this.load.spritesheet(
      "placeholderSpritesheet",
      "src/assets/spritesheets/placeholder.png",
      {
        frameWidth: 24,
        frameHeight: 24,
      }
    );
  }

  async create() {
    this.cloudsImage = this.add.image(0, 0, "clouds").setScale(10);

    this.anims.create({
      key: "placeholderSpritesheet-walk",
      frames: this.anims.generateFrameNumbers("placeholderSpritesheet", {
        frames: [1, 2, 3, 4],
      }),
      frameRate: 10,
      repeat: -1,
    });

    const zombits = Array.from(
      await getAssetNames(
        "ad6290066292cfeef7376cd575e5d8367833ab3d8b2ac53d26ae4ecc"
      )
    );
    const humbits = Array.from(
      await getAssetNames(
        "d44cba92bdb8e40360c3979cdc2cf289cdc3aed44e4f3f2bf8aa6def"
      )
    );

    this.zombitsLogoImage = this.add.image(0, 0, "zombitsLogo").setScale(2);
    this.humbitsLogoImage = this.add.image(0, 0, "humbitsLogo").setScale(2);

    this.previousZombitsButton = this.add
      .image(0, 0, "leftButton")
      .setInteractive({ useHandCursor: true })
      .on(Phaser.Input.Events.POINTER_OVER, () => {
        this.previousZombitsButton.setTexture("leftButtonPressed");
      })
      .on(Phaser.Input.Events.POINTER_OUT, () =>
        this.previousZombitsButton.setTexture("leftButton")
      )
      .on(Phaser.Input.Events.POINTER_UP, () => {
        this.currentZombits = updateCharactersPage(
          this,
          zombits,
          this.charactersPerPage,
          --this.zombitsPageIndex,
          this.previousZombitsButton,
          this.nextZombitsButton,
          this.currentZombits
        );
      });

    this.nextZombitsButton = this.add
      .image(0, 0, "rightButton")
      .setInteractive({ useHandCursor: true })
      .on(Phaser.Input.Events.POINTER_OVER, () => {
        this.nextZombitsButton.setTexture("rightButtonPressed");
      })
      .on(Phaser.Input.Events.POINTER_OUT, () =>
        this.nextZombitsButton.setTexture("rightButton")
      )
      .on(Phaser.Input.Events.POINTER_UP, () => {
        this.currentZombits = updateCharactersPage(
          this,
          zombits,
          this.charactersPerPage,
          ++this.zombitsPageIndex,
          this.previousZombitsButton,
          this.nextZombitsButton,
          this.currentZombits
        );
      });

    this.currentZombits = updateCharactersPage(
      this,
      zombits,
      this.charactersPerPage,
      this.zombitsPageIndex,
      this.previousZombitsButton,
      this.nextZombitsButton,
      this.currentZombits
    );

    if (this.currentZombits.length === 0) {
      this.zombitsBuyNowButton = this.add
        .image(0, 0, "buyNowButton")
        .setScale(2)
        .setInteractive({ useHandCursor: true })
        .on(Phaser.Input.Events.POINTER_OVER, () => {
          this.zombitsBuyNowButton.setTexture("buyNowButtonPressed");
        })
        .on(Phaser.Input.Events.POINTER_OUT, () =>
          this.zombitsBuyNowButton.setTexture("buyNowButton")
        )
        .on(Phaser.Input.Events.POINTER_UP, () => {
          window.open("https://cnft.io/marketplace?project=Zombits", "_blank");
        });
    }

    this.previousHumbitsButton = this.add
      .image(0, 0, "leftButton")
      .setInteractive({ useHandCursor: true })
      .on(Phaser.Input.Events.POINTER_OVER, () => {
        this.previousHumbitsButton.setTexture("leftButtonPressed");
      })
      .on(Phaser.Input.Events.POINTER_OUT, () =>
        this.previousHumbitsButton.setTexture("leftButton")
      )
      .on(Phaser.Input.Events.POINTER_UP, () => {
        this.currentHumbits = updateCharactersPage(
          this,
          humbits,
          this.charactersPerPage,
          --this.humbitsPageIndex,
          this.previousHumbitsButton,
          this.nextHumbitsButton,
          this.currentHumbits
        );
      });

    this.nextHumbitsButton = this.add
      .image(0, 0, "rightButton")
      .setInteractive({ useHandCursor: true })
      .on(Phaser.Input.Events.POINTER_OVER, () => {
        this.nextHumbitsButton.setTexture("rightButtonPressed");
      })
      .on(Phaser.Input.Events.POINTER_OUT, () =>
        this.nextHumbitsButton.setTexture("rightButton")
      )
      .on(Phaser.Input.Events.POINTER_UP, () => {
        this.currentHumbits = updateCharactersPage(
          this,
          humbits,
          this.charactersPerPage,
          ++this.humbitsPageIndex,
          this.previousHumbitsButton,
          this.nextHumbitsButton,
          this.currentHumbits
        );
      });

    this.currentHumbits = updateCharactersPage(
      this,
      humbits,
      this.charactersPerPage,
      this.humbitsPageIndex,
      this.previousHumbitsButton,
      this.nextHumbitsButton,
      this.currentHumbits
    );

    if (this.currentHumbits.length === 0) {
      this.humbitsBuyNowButton = this.add
        .image(0, 0, "buyNowButton")
        .setScale(2)
        .setInteractive({ useHandCursor: true })
        .on(Phaser.Input.Events.POINTER_OVER, () => {
          this.humbitsBuyNowButton.setTexture("buyNowButtonPressed");
        })
        .on(Phaser.Input.Events.POINTER_OUT, () =>
          this.humbitsBuyNowButton.setTexture("buyNowButton")
        )
        .on(Phaser.Input.Events.POINTER_UP, () => {
          window.open("https://cnft.io/marketplace?project=Humbits", "_blank");
        });
    }
  }

  update() {
    updateObjectPosition(
      this.cloudsImage,
      this.cameras.main.width / 2,
      this.cameras.main.height / 2
    );

    updateObjectPosition(
      this.zombitsLogoImage,
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 300
    );

    this.currentZombits.forEach(({ image, label }, i) => {
      updateObjectPosition(
        image,
        this.cameras.main.width / 2 +
          200 * (i - (this.currentZombits.length - 1) / 2),
        this.cameras.main.height / 2 - 150
      );
      updateObjectPosition(
        label,
        image.x - label.width / 2,
        this.cameras.main.height / 2 - 50
      );
    });

    updateObjectPosition(
      this.zombitsBuyNowButton,
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 150
    );

    updateObjectPosition(
      this.previousZombitsButton,
      this.cameras.main.width / 2 - 450,
      this.cameras.main.height / 2 - 150
    );
    updateObjectPosition(
      this.nextZombitsButton,
      this.cameras.main.width / 2 + 450,
      this.cameras.main.height / 2 - 150
    );

    updateObjectPosition(
      this.humbitsLogoImage,
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 50
    );

    this.currentHumbits.forEach(({ image, label }, i) => {
      updateObjectPosition(
        image,
        this.cameras.main.width / 2 +
          200 * (i - (this.currentHumbits.length - 1) / 2),
        this.cameras.main.height / 2 + 200
      );
      updateObjectPosition(
        label,
        image.x - label.width / 2,
        this.cameras.main.height / 2 + 300
      );
    });

    updateObjectPosition(
      this.humbitsBuyNowButton,
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 200
    );

    updateObjectPosition(
      this.previousHumbitsButton,
      this.cameras.main.width / 2 - 450,
      this.cameras.main.height / 2 + 200
    );
    updateObjectPosition(
      this.nextHumbitsButton,
      this.cameras.main.width / 2 + 450,
      this.cameras.main.height / 2 + 200
    );
  }
}
