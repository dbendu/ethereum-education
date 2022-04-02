const HDWalletProvider = require("truffle-hdwallet-provider");
const { interface, bytecode } = require("./compile.js");
const Web3 = require("web3");
const config = require("./config.json");

const provider = new HDWalletProvider(
    config.mnemonicPhrase,
    config.connectionString
);

const web3 = new Web3(provider);

const deploy = async () => {
    const accounts = await web3.eth.getAccounts();
    
    var lottery = await new web3.eth
        .Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: 1000000 });

    console.log("Deployed contract address:", lottery.options.address);
}

deploy();

console.log("exit");