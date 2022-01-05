import Phaser from "phaser";

export default class Player extends Phaser.GameObjects.Sprite {
  constructor({ scene, x, y, character, collider }) {
    super(scene, x, y, character);

    this.scene.add.existing(this);
    this.scene.physics.world.enableBody(this);
    this.scene.physics.add.collider(this, collider);

    this.setScale(2);

    this.body.setSize(12, 6);
    this.body.setOffset(6, 18);
    this.body.setCollideWorldBounds(true);

    this.scene.anims.create({
      key: `${this.texture.key}-walk`,
      frames: this.scene.anims.generateFrameNumbers(this.texture.key, {
        frames: [1, 2, 3, 4],
      }),
      frameRate: 10,
      repeat: -1,
    });

    // Player speed
    this.speed = 150;

    // Register cursors for player movement
    this.cursors = this.scene.input.keyboard.createCursorKeys();
  }

  update() {
    // Stop any previous movement from the last frame
    this.body.setVelocity(0);

    // Horizontal movement
    if (this.cursors.left.isDown) {
      this.body.setVelocityX(-this.speed);
    } else if (this.cursors.right.isDown) {
      this.body.setVelocityX(this.speed);
    }

    // Vertical movement
    if (this.cursors.up.isDown) {
      this.body.setVelocityY(-this.speed);
    } else if (this.cursors.down.isDown) {
      this.body.setVelocityY(this.speed);
    }

    // Normalize and scale the velocity so that player can't move faster along a diagonal
    this.body.velocity.normalize().scale(this.speed);

    // Run animations
    if (
      this.cursors.left.isDown ||
      this.cursors.right.isDown ||
      this.cursors.up.isDown ||
      this.cursors.down.isDown
    ) {
      if (this.anims) {
        this.anims.play(`${this.texture.key}-walk`, true);
      }
      if (this.cursors.left.isDown) {
        this.setFlipX(true);
      } else if (this.cursors.right.isDown) {
        this.setFlipX(false);
      }
    } else {
      if (this.anims) {
        this.anims.stop();
      }
      this.setFrame(0);
    }
  }

  getDirection() {
    return this.flipX ? "left" : "right";
  }
}
