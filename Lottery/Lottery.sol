pragma solidity ^0.8.13;

// SPDX-License-Identifier: UNLICENSED

contract Lottery {
    uint private constant USER_NOT_FOUND = 2**256 - 1;

    address private manager;
    address payable[] private players;

    constructor() {
        manager = msg.sender;
    }

    function join()
    public
    payable
    {
        require(!userJoined(msg.sender));
        require(msg.value == 1 ether);

        players.push(payable(msg.sender));
    }

    //TODO: удалять из списка окончательно?
    function leave()
    public
    payable
    {
        require(userJoined(msg.sender));

        payable(msg.sender).transfer(1 ether);
        delete players[userIndex(msg.sender)];
    }

    //TODO: добавить комиссию (проблема из-за отсутствия fixed)
    function draw()
    public
    payable
    {
        require(msg.sender == manager);
        require(players.length != 0);

        uint winnerIndex = random() % players.length;
        players[winnerIndex].transfer(address(this).balance);

        reset();
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

    function reset()
    private
    {
        players = new address payable[](0);
    }
}