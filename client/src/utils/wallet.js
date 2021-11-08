const cardanoSerialization = require("@emurgo/cardano-serialization-lib-asmjs/cardano_serialization_lib");

export const hasWallet = () => {
  return typeof cardano !== "undefined";
};

export const isWalletConnected = async () => {
  return hasWallet() && (await cardano.isEnabled());
};

export const connectWallet = async () => {
  try {
    return await cardano.enable();
  } catch {
    return false;
  }
};

export const getAssetNames = async (policyId) => {
  if (!isWalletConnected()) {
    return new Set();
  }
  const balance = await cardano.getBalance();
  const value = cardanoSerialization.Value.from_bytes(
    Buffer.from(balance, "hex")
  );
  const policyHash = cardanoSerialization.ScriptHash.from_bytes(
    cardanoSerialization.Ed25519KeyHash.from_bytes(
      Buffer.from(policyId, "hex")
    ).to_bytes()
  );

  const result = new Set();
  const walletMultiasset = value.multiasset();
  if (!walletMultiasset) {
    return result;
  }
  const walletAssets = walletMultiasset.get(policyHash);
  if (!walletAssets) {
    return result;
  }
  const assetNames = walletAssets.keys();
  for (let i = 0; i < assetNames.len(); i++) {
    result.add(Buffer.from(assetNames.get(i).name()).toString());
  }
  return result;
};
