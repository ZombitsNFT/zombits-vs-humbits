const getNameFromPrefix = (prefix, character) => {
  if (character.startsWith(prefix)) {
    return `${prefix} #${character.split(prefix)[1]}`;
  }
};

export const getZombitName = (character) => {
  return getNameFromPrefix("Zombit", character);
};

export const getHumbitName = (character) => {
  return getNameFromPrefix("Humbit", character);
};

export const isZombitName = (character) => {
  return getZombitName(character) !== undefined;
};

export const isHumbitName = (character) => {
  return getHumbitName(character) !== undefined;
};

export const getCharacterName = (character) => {
  return getZombitName(character) || getHumbitName(character);
};
