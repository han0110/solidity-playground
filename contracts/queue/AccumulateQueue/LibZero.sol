// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;

library LibZero {
    function zero(uint256 depth) public pure returns (uint256) {} // solhint-disable-line no-empty-blocks
}

library LibZeroPoseidonL5D2 {
    function zero(uint256 depth) public pure returns (uint256) {
        return
            [
                8370432830353022751713833565135785980866757267633941821328460903436894336785,
                12870344859288254819458525815912596827440323243568958650932054310464019135959,
                3287158791451884386974306006868941068261186651168967337354977306728557645929
            ][depth];
    }
}
