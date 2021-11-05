import { paginate } from "./array";
import { getCharacterName, getZombitName } from "./string";

export const addProgressBar = (scene) => {
  scene.load.on(Phaser.Loader.Events.START, () => {
    const primaryColor = 0xfafafa;
    const secondaryColor = 0x95d2f0;
    const width = 256;
    const height = 16;
    const x = scene.cameras.main.width / 2 - width / 2;
    const y = scene.cameras.main.height / 2 - height / 2;

    const progressBox = scene.add
      .graphics()
      .fillStyle(secondaryColor)
      .fillRect(x, y, width, height);
    const progressBar = scene.add.graphics();

    scene.load.on(Phaser.Loader.Events.PROGRESS, (value) => {
      progressBar
        .clear()
        .fillStyle(primaryColor)
        .fillRect(x, y, width * value, height);
    });

    scene.load.on(Phaser.Loader.Events.COMPLETE, () => {
      progressBar.destroy();
      progressBox.destroy();
    });
  });
};

export const addCharacters = (scene, characters) => {
  const references = [];
  characters.forEach((character) => {
    const reference = {
      image: scene.add.image(0, 0, "placeholderSpritesheet").setScale(8),
      label: scene.add.text(0, 0, getCharacterName(character)),
    };
    references.push(reference);
    scene.load.spritesheet(
      character,
      `src/assets/spritesheets/${
        getZombitName(character) ? "zombits" : "humbits"
      }/${character}.png`,
      {
        frameWidth: 24,
        frameHeight: 24,
      }
    );
    scene.load.once(Phaser.Loader.Events.COMPLETE, () => {
      reference.image
        .setTexture(character)
        .setInteractive({ useHandCursor: true })
        .on(Phaser.Input.Events.POINTER_UP, () => {
          console.log(`Selected character: ${character}`);
          scene.registry.set("chosenCharacter", character);
          scene.scene.start("mainMenu");
        });
    });
    scene.load.start();
  });
  return references;
};

export const destroyCharacters = (references) => {
  references.forEach(({ image, label }) => {
    image.destroy();
    label.destroy();
  });
};

export const updateCharactersPage = (
  scene,
  characters,
  pageSize,
  pageIndex,
  previousButton,
  nextButton,
  currentCharacters
) => {
  if (pageIndex < 1) {
    // Disable left button on first page
    previousButton.setTexture("leftButtonDisabled").removeInteractive();
  } else if (!previousButton.input) {
    // Enable left button if disabled
    previousButton
      .setTexture("leftButton")
      .setInteractive({ useHandCursor: true });
  }

  if (pageIndex > Math.floor(characters.length / pageSize) - 1) {
    // Disable right button on last page
    nextButton.setTexture("rightButtonDisabled").removeInteractive();
  } else if (!nextButton.input) {
    // Enable right button if disabled
    nextButton
      .setTexture("rightButton")
      .setInteractive({ useHandCursor: true });
  }

  const charactersToShow = paginate(characters, pageSize, pageIndex);
  destroyCharacters(currentCharacters);
  return addCharacters(scene, charactersToShow);
};

export const updateObjectPosition = (object, x, y) => {
  if (object && (object.x != x || object.y != y)) {
    object.setPosition(x, y);
  }
};
