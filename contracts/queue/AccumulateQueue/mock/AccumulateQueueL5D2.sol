// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;

import "../LibAccumulateQueueL5D2.sol";

contract AccumulateQueueL5D2 {
    using LibAccumulateQueueL5D2 for LibAccumulateQueueL5D2.AccumulateQueue;

    LibAccumulateQueueL5D2.AccumulateQueue private _leafQueue;
    uint256[] private _roots;

    function enqueue(uint256 leaf) public {
        if (_leafQueue.enqueue(leaf)) {
            _roots.push(_leafQueue.collect());
        }
    }

    function fill() public {
        _leafQueue.fill();
        _roots.push(_leafQueue.collect());
    }

    function fillToSingle() public {
        _leafQueue.fillToSingle();
        _roots.push(_leafQueue.collect());
    }

    function getLeaf(uint256 depth, uint256 indice)
        public
        view
        returns (uint256)
    {
        return _leafQueue.depthToSubqueue[depth][indice];
    }

    function getLeafSize() public view returns (uint256) {
        return _leafQueue.size;
    }

    function getRoot(uint256 index) public view returns (uint256) {
        return _roots[index];
    }
}
