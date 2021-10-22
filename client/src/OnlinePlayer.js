import Phaser from "phaser";

export default class OnlinePlayer extends Phaser.GameObjects.Sprite {
  constructor({ scene, socketId, x, y }) {
    super(scene, x, y, socketId);
    this.map = "town"; //??

    this.scene.add.existing(this);
    this.scene.physics.world.enableBody(this);

    this.setTexture("players", "bob_front.png").setScale(1.9, 2.1);

    // Player Offset
    this.body.setOffset(0, 24);

    // Display playerId above player
    this.playerNickname = this.scene.add.text(
      this.x - 40,
      this.y - 25,
      socketId
    );
  }

  isWalking(direction, x, y) {
    // Player
    this.anims.play(`onlinePlayer-${direction}-walk`, true);
    this.setPosition(x, y);

    // PlayerId
    this.playerNickname.x = this.x - 40;
    this.playerNickname.y = this.y - 25;
  }

  stopWalking(direction) {
    this.anims.stop();
    this.setTexture("players", `bob_${direction}.png`);
  }

  destroy() {
    super.destroy();
    this.playerNickname.destroy();
  }
}
