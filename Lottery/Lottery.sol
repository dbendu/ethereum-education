pragma solidity ^0.8.13;

// SPDX-License-Identifier: UNLICENSED

contract Lottery {
    uint private constant USER_NOT_FOUND = type(uint256).max;
    uint private constant commission = 95; // percents

    uint private currentContribution; // in wei
    uint private nextRoundContribution; // in wei

    address private manager;
    address payable[] private players;

    constructor(uint contribution) {
        nextRoundContribution = contribution;
        manager = msg.sender;

        runNextRound();
    }

    function join()
    public
    payable
    {
        require(!userJoined(msg.sender), "You are playing already");
        require(msg.value == currentContribution, "Incorrect sum");

        players.push(payable(msg.sender));
    }

    //TODO: improvements: удалять из списка окончательно
    function leave()
    public
    payable
    {
        require(userJoined(msg.sender), "You are not playing yet");

        payable(msg.sender).transfer(currentContribution);
        delete players[userIndex(msg.sender)];
    }

    function draw()
    public
    payable
    onlyManagerAllowed
    {
        require(players.length != 0, "No players yet");

        uint winnerIndex = random() % players.length;
        uint winning = address(this).balance * commission / 100;

        players[winnerIndex].transfer(winning);
        payable(manager).transfer(address(this).balance);

        runNextRound();
    }

    function updateContribution(uint newContribution)
    public
    onlyManagerAllowed
    {
        nextRoundContribution = newContribution;
    }

    function userIndex(address user)
    private
    view
    returns (uint)
    {
        for (uint i = 0; i < players.length; ++i) {
            if (players[i] == user)
                return i;
        }
        return USER_NOT_FOUND;
    }

    function userJoined(address user)
    private
    view
    returns (bool)
    {
        return userIndex(user) != USER_NOT_FOUND;
    }

    function random()
    private
    view
    returns (uint)
    {
        bytes memory packedData = abi.encodePacked(block.difficulty, block.timestamp, players);
        bytes32 hash = keccak256(packedData);

        return uint(hash);
    }

    function runNextRound()
    private
    {
        players = new address payable[](0);
        currentContribution = nextRoundContribution;
    }

    modifier onlyManagerAllowed()
    {
        require(msg.sender == manager, "Only manager allowed to this functionality");
        _;
    }
}