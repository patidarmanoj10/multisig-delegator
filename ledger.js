"use strict";
const ethers = require("ethers");
const fetch = require("node-fetch");
const LedgerSigner = require("@anders-t/ethers-ledger").LedgerSigner;

// Change below values
const TX_SERVICE_BASE_URL = "https://safe-transaction.optimism.gnosis.io/api/v1/delegates/";  // mainnet
// const TX_SERVICE_BASE_URL = "https://safe-transaction.avalanche.gnosis.io/api/v1/delegates/";  // avalanche
// const TX_SERVICE_BASE_URL = "https://safe-transaction.polygon.gnosis.io/api/v1/delegates/";  // polygon
const path = "m/44'/60'/0'/0/0"; // using account 2 from ledger as ledger account 2 is safe owner in my case.
const SAFE_ADDRESS = "0x32934AD7b1121DeFC631080b58599A0eaAB89878";
const DELEGATE_ADDRESS = "0xF5F5195cF6998c57C651f9f0bBFA7cFC72a6FaC1";

const provider = new ethers.providers.JsonRpcProvider();
const signer = new LedgerSigner(provider, path);

// prepare message hash
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
    label: "Vesper delegator ledger",
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
