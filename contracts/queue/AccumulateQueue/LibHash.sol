// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;

library LibHashL2 {
    function hash(uint256[2] memory input) public pure returns (uint256) {} // solhint-disable-line no-empty-blocks
}

library LibHashL5 {
    function hash(uint256[5] memory input) public pure returns (uint256) {} // solhint-disable-line no-empty-blocks
}

library LibHashKeccak256L2 {
    function hash(uint256[2] memory input) public pure returns (uint256) {
        return
            uint256(sha256(abi.encodePacked(input))) %
            21888242871839275222246405745257275088548364400416034343698204186575808495617;
    }
}

library LibHashKeccak256L5 {
    function hash(uint256[5] memory input) public pure returns (uint256) {
        return
            uint256(sha256(abi.encodePacked(input))) %
            21888242871839275222246405745257275088548364400416034343698204186575808495617;
    }
}
