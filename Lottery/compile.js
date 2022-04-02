const path = require('path');
const fs = require('fs');
const solc = require('solc');

const lotteryPath = path.resolve(__dirname, 'Lottery.sol');
const source = fs.readFileSync(lotteryPath, 'utf8');

const input = {
    language: 'Solidity',
    sources: {
        'Lottery.sol': { content: source }
    },
    settings: {
        outputSelection: {
            '*': { '*': ['*'] }
        }
    }
};

const compiled = solc.compile(JSON.stringify(input));
const contract = JSON.parse(compiled);

const toExport = {
    interface: JSON.stringify(contract.contracts["Lottery.sol"].Lottery.abi),
    bytecode: contract.contracts["Lottery.sol"].Lottery.evm.bytecode.object
};

module.exports = toExport;