import Phaser from "phaser";
import { addProgressBar, updateObjectPosition } from "../utils/scene";
import { connectWallet, hasWallet, isWalletConnected } from "../utils/wallet";

export default class ConnectWallet extends Phaser.Scene {
  constructor() {
    super("connectWallet");
  }

  init() {
    // This method is called by the Scene Manager when the scene starts, before preload() and create().
  }

  preload() {
    // Use it to load assets. This method is called by the Scene Manager, after init() and before create(),
    // only if the Scene has a LoaderPlugin. After this method completes, if the LoaderPlugin's queue isn't empty,
    // the LoaderPlugin will start automatically.
    addProgressBar(this);

    this.load.image(
      "zombitsVsHumbitsLogo",
      "src/assets/images/zombits-vs-humbits-logo.png"
    );
    this.load.image("getNamiButton", "src/assets/images/get-nami-button.png");
    this.load.image(
      "getNamiButtonPressed",
      "src/assets/images/get-nami-button-pressed.png"
    );
    this.load.image(
      "connectWalletButton",
      "src/assets/images/connect-wallet-button.png"
    );
    this.load.image(
      "connectWalletButtonPressed",
      "src/assets/images/connect-wallet-button-pressed.png"
    );
    this.load.image("clouds", "src/assets/images/clouds.png");
  }

  async create() {
    // Use it to create your game objects. This method is called by the Scene Manager when the scene starts,
    // after init() and preload(). If the LoaderPlugin started after preload(), then this method is called
    // only after loading is complete.
    if (await isWalletConnected()) {
      this.scene.start("chooseCharacter");
      return;
    }

    this.cloudsImage = this.add.image(0, 0, "clouds").setScale(10);

    this.zombitsVsHumbitsLogoImage = this.add
      .image(0, 0, "zombitsVsHumbitsLogo")
      .setScale(3);

    if (!hasWallet()) {
      this.getNamiButtonImage = this.add
        .image(0, 0, "getNamiButton")
        .setScale(3)
        .setInteractive({ useHandCursor: true })
        .on(Phaser.Input.Events.POINTER_OVER, () => {
          this.getNamiButtonImage.setTexture("getNamiButtonPressed");
        })
        .on(Phaser.Input.Events.POINTER_OUT, () =>
          this.getNamiButtonImage.setTexture("getNamiButton")
        )
        .on(Phaser.Input.Events.POINTER_UP, () => {
          window.open("https://namiwallet.io/", "_blank");
        });
      return;
    }

    this.connectWalletButtonImage = this.add
      .image(0, 0, "connectWalletButton")
      .setScale(3)
      .setInteractive({ useHandCursor: true })
      .on(Phaser.Input.Events.POINTER_OVER, () => {
        this.connectWalletButtonImage.setTexture("connectWalletButtonPressed");
      })
      .on(Phaser.Input.Events.POINTER_OUT, () =>
        this.connectWalletButtonImage.setTexture("connectWalletButton")
      )
      .on(Phaser.Input.Events.POINTER_UP, async () => {
        if (await connectWallet()) {
          await this.create();
        }
      });
  }

  update() {
    // Should be overridden by your own Scenes. This method is called once per game step while the scene is running.
    updateObjectPosition(
      this.cloudsImage,
      this.cameras.main.width / 2,
      this.cameras.main.height / 2
    );
    updateObjectPosition(
      this.zombitsVsHumbitsLogoImage,
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 100
    );
    updateObjectPosition(
      this.connectWalletButtonImage,
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 100
    );
    updateObjectPosition(
      this.getNamiButtonImage,
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 100
    );
  }
}
