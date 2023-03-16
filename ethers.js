"use strict";
const ethers = require("ethers");
const fetch = require("node-fetch");

// Change below values.
const TX_SERVICE_BASE_URL = "https://safe-transaction.mainnet.gnosis.io/api/v1/delegates/";  // Goerli testnet
const SAFE_ADDRESS = "0xd1DE3F9CD4AE2F23DA941a67cA4C739f8dD9Af33";
const DELEGATE_ADDRESS = "0x415344d56874eC6397Bf6Fe0075bb41E0086Aee5";
const accountIndex = 5
let signer = new ethers.Wallet.fromMnemonic(process.env.MNEMONIC, `m/44'/60'/0'/0/${accountIndex}`);
signer.getAddress().then(console.log)
const totp = Math.floor(Date.now() / 1000 / 3600);
let msgHash = ethers.utils.solidityKeccak256([ "string" ], [ DELEGATE_ADDRESS + totp ]);
let messageHashBinary = ethers.utils.arrayify(msgHash);

async function createDelegate() {
  const owner = await signer.getAddress();
  let signature = await signer.signMessage(messageHashBinary);
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
