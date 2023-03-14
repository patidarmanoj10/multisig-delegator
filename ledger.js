"use strict";
const ethers = require("ethers");
const fetch = require("node-fetch");
const LedgerSigner = require("@anders-t/ethers-ledger").LedgerSigner;

// Change below values
const TX_SERVICE_BASE_URL = "https://safe-transaction.mainet.gnosis.io/api/v1/delegates/";  // mainnet
// const TX_SERVICE_BASE_URL = "https://safe-transaction.avalanche.gnosis.io/api/v1/delegates/";  // avalanche
// const TX_SERVICE_BASE_URL = "https://safe-transaction.polygon.gnosis.io/api/v1/delegates/";  // polygon
const path = "m/44'/60'/0'/0/0"; // using account 2 from ledger as ledger account 2 is safe owner in my case.
const SAFE_ADDRESS = "0x9520b477Aa81180E6DdC006Fc09Fb6d3eb4e807A";
const DELEGATE_ADDRESS = "0x76d266DFD3754f090488ae12F6Bd115cD7E77eBD";

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
