const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");

const web3 = new Web3(ganache.provider());
const { interface, bytecode } = require("./compile.js");

const ValueForJoining = web3.utils.toWei("1", "ether");

let managerAccount;
let anonymousAccount;
let lottery;
let accounts;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    managerAccount = accounts[0];
    anonymousAccount = accounts[1];

    lottery = await
        new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: managerAccount, gas: 1000000 })
});

 it("Deployed successfully", () => assert.ok(lottery.options.address));

describe("Joining tests", async () => {
    it("Join", async () => await join(accounts[0]));

    it ("Cannot join twice", async () => {
        await join(accounts[0]);
        assertAsyncThrows(() => join(accounts[0]));
    });

    it("Cannot join without payment", () =>
        assertAsyncThrows(() => join(accounts[0], 0))
    );

    it("Cannot join with invalid amount", () =>
        assertAsyncThrows(() => join(accounts[0], ValueForJoining * 2))
    );
});

describe("Leaving tests", async () => {
    it("Leave", async () => {
        await join(accounts[0]);
        await leave(accounts[0]);
    });

    it("Anonymous cannot leave", () => assertAsyncThrows(() => leave(accounts[0])));
});

describe("Draw lottery", async () => {
    it("No players", () => assertAsyncThrows(() => draw(managerAccount)));

    it("Triggered by anonymous", () => assertAsyncThrows(() => draw(anonymousAccount)));

    it("Positive", async () => {
        await join(managerAccount);
        await join(anonymousAccount);

        await draw(managerAccount);
    })
});

const join = async (user, amount = ValueForJoining) => {
    await lottery.methods
        .join()
        .send({ from: user, value: amount });
}

const leave = async (user) => {
    await lottery.methods
        .leave()
        .send({ from: user });
}

const draw = async (user) => {
    await lottery.methods
        .draw()
        .send({ from: user });
}

const assertAsyncThrows = (action) => {
    action()
        .then(() => assert.fail("Exception expected in asynchronous method"))
        .catch((err) => assert.equal(err.message, "VM Exception while processing transaction: revert"));
}