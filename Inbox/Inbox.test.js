const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");

const web3 = new Web3(ganache.provider());
const { interface, bytecode } = require("./compile.js")

const InitialMessage = "Hello world!";

let accounts;
let inbox;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    inbox = await
        new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode, arguments: [ InitialMessage ] })
        .send({ from: accounts[0], gas: 1000000 });
});

describe("inbox tests", () => {
    it("Deployed successfully", () => assert.ok(inbox.options.address));

    it("getMessage", async () => {
        const actualMessage = await inbox.methods.message().call();
        assert.equal(actualMessage, InitialMessage);
    });

    it("Changing message", async () => {
        const newMessage = "Welkome world!";
        
        await inbox.methods
            .setMessage(newMessage)
            .send({ from: accounts[0] });

        const actualMessage = await inbox.methods.message().call();
        assert.equal(actualMessage, newMessage);
    });
})