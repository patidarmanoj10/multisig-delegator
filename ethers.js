"use strict";
const ethers = require("ethers");
const fetch = require("node-fetch");

// Change below values.
const TX_SERVICE_BASE_URL =
  "https://safe-transaction.optimism.gnosis.io/api/v1/delegates/"; // Goerli testnet
const SAFE_ADDRESS = "0xE01Df4ac1E1e57266900E62C37F12C986495A618";
const DELEGATE_ADDRESS = "0xF5F5195cF6998c57C651f9f0bBFA7cFC72a6FaC1";
const accountIndex = 5;
let wallet = new ethers.Wallet.fromMnemonic(
  process.env.MNEMONIC,
  `m/44'/60'/0'/0/${accountIndex}`
);

const totp = Math.floor(Date.now() / 1000 / 3600);
let msgHash = ethers.utils.solidityKeccak256(
  ["string"],
  [DELEGATE_ADDRESS + totp]
);
let messageHashBinary = ethers.utils.arrayify(msgHash);

async function createDelegate() {
  const owner = await wallet.getAddress();
  let signature = await wallet.signMessage(messageHashBinary);
  const data = {
    safe: SAFE_ADDRESS,
    delegate: DELEGATE_ADDRESS,
    delegator: owner,
    // refer https://github.com/gnosis/safe-contracts/blob/main/src/utils/execution.ts#L97
    signature: signature.replace(/1b$/, "1f").replace(/1c$/, "20"),
    label: "delegate1",
  };
  console.log({ data });

  // send request to add delegator
  const response = await fetch(TX_SERVICE_BASE_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  response.json().then((data) => {
    console.log(data);
  });
}

createDelegate();
