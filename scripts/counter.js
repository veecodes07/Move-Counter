require("dotenv").config();

const aptos = require("aptos");

const NODE_URL = process.env.APTOS_NODE_URL || "https://fullnode.devnet.aptoslabs.com";
const FAUCET_URL = process.env.APTOS_FAUCET_URL || "https://faucet.devnet.aptoslabs.com";

const aptosCoin = "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>";

(async () => {
  const client = new aptos.AptosClient(NODE_URL);
  const faucetClient = new aptos.FaucetClient(NODE_URL, FAUCET_URL, null);
  const tokenClient = new aptos.TokenClient(client);
  const privateKey = new aptos.HexString("0xcd11efd4a06aaabc56d7127d42784d9047e4e27283a2760c8e1e3618743aa956");
  const account1 = new aptos.AptosAccount(privateKey.toUint8Array());

  await faucetClient.fundAccount(account1.address(), 100000000);
  
  console.log(`account1's address:${account1.address()}`)
  let resources = await client.getAccountResources(account1.address());
  let accountResource = resources.find((r) => r.type === aptosCoin);
  console.log(`account2 coins: ${accountResource.data.coin.value}. Should be 100_000_000!`);

  const payload = {
    type: "entry_function_payload",
    function: "9d3c951029c2100694952ad32fcfa17feb06362a325a311736aa58082ce55d8e::MyCounter::incr_counter_by",
    type_arguments: [],
    arguments: [6],
  };
  const txnRequest = await client.generateTransaction(account1.address(), payload);
  const signedTxn = await client.signTransaction(account1, txnRequest);
  const transactionRes = await client.submitTransaction(signedTxn);
  await client.waitForTransaction(transactionRes.hash);
  
})();

// aptos move run --function-id 227e55dffc5c4362e9376f86c87cf412e8462498da2dddf385103abff3b3150e::MyCounter::init_counter  --profile $PROFILE
