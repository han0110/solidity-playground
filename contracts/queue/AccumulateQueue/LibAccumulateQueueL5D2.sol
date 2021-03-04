// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;

import { LibHashL5 } from "./LibHash.sol";
import { LibZero } from "./LibZero.sol";

library LibAccumulateQueueL5D2 {
    using LibAccumulateQueueL5D2 for AccumulateQueue;

    uint256 public constant LENGTH = 5; // how many item needed to merge into one for next depth
    uint256 public constant DEPTH = 2;
    uint256 public constant CAPACITY = LENGTH**DEPTH;

    struct AccumulateQueue {
        uint256 size;
        uint256 accumulated;
        uint256[LENGTH - 1][DEPTH] depthToSubqueue;
        uint256[DEPTH] depthToIndice;
    }

    function enqueue(AccumulateQueue storage queue, uint256 leaf)
        internal
        returns (bool readyToCollect)
    {
        readyToCollect = _enqueue(queue, 0, leaf);
        queue.size++;
    }

    function fill(AccumulateQueue storage queue)
        internal
        returns (bool readyToCollect)
    {
        readyToCollect = _fill(queue, 0, DEPTH);
        queue.size = CAPACITY;
    }

    function fillToSingle(AccumulateQueue storage queue)
        internal
        returns (bool)
    {
        uint256 nextDepth = _nextDepth(queue);

        _fill(queue, 0, nextDepth);
        queue.size = LENGTH**nextDepth;

        if (queue.accumulated == 0) {
            queue.accumulated = queue.depthToSubqueue[nextDepth][0];
        }

        return true;
    }

    function collect(AccumulateQueue storage queue) internal returns (uint256) {
        require(queue.accumulated != 0, "NOT_ACCUMULATED");

        uint256 accumulated = queue.accumulated;
        queue.reset();

        return accumulated;
    }

    function reset(AccumulateQueue storage queue) internal {
        delete queue.size;
        delete queue.accumulated;
        delete queue.depthToSubqueue;
        delete queue.depthToIndice;
    }

    function _enqueue(
        AccumulateQueue storage queue,
        uint256 depth,
        uint256 leaf
    ) private returns (bool readyToCollect) {
        require(queue.accumulated == 0, "NOT_COLLECTED");
        require(depth <= DEPTH, "TOO_DEEP");

        while (true) {
            if (depth == DEPTH) {
                queue.accumulated = leaf;
                return true;
            }

            uint256 indice = queue.depthToIndice[depth];

            if (indice < LENGTH - 1) {
                queue.depthToSubqueue[depth][indice] = leaf;
                queue.depthToIndice[depth] = indice + 1;
                return false;
            }

            // Merge subqueue and enqueue to next depth
            leaf = LibHashL5.hash(
                [
                    queue.depthToSubqueue[depth][0],
                    queue.depthToSubqueue[depth][1],
                    queue.depthToSubqueue[depth][2],
                    queue.depthToSubqueue[depth][3],
                    leaf
                ]
            );
            delete queue.depthToIndice[depth];
            delete queue.depthToSubqueue[depth];
            depth++;
        }
    }

    function _fill(
        AccumulateQueue storage queue,
        uint256 fromDepth,
        uint256 toDepth
    ) private returns (bool readyToCollect) {
        require(queue.accumulated == 0, "NOT_COLLECTED");

        if (queue.size == 0) {
            queue.accumulated = LibZero.zero(DEPTH);
            return true;
        }

        while (fromDepth < toDepth) {
            uint256 indice = queue.depthToIndice[fromDepth];

            if (indice != 0) {
                uint256 zero = LibZero.zero(fromDepth);
                uint256[5] memory inputs;

                uint8 i = 0;
                for (; i < indice; i++) {
                    inputs[i] = queue.depthToSubqueue[fromDepth][i];
                }
                for (; i < LENGTH; i++) {
                    inputs[i] = zero;
                }

                readyToCollect = _enqueue(
                    queue,
                    fromDepth + 1,
                    LibHashL5.hash(inputs)
                );

                delete queue.depthToIndice[fromDepth];
                delete queue.depthToSubqueue[fromDepth];
            }

            fromDepth++;
        }
    }

    function _nextDepth(AccumulateQueue storage queue)
        internal
        view
        returns (uint256)
    {
        uint256 depth = 1;
        uint256 pow = LENGTH;
        while (pow < queue.size) {
            depth++;
            pow *= LENGTH;
        }
        return depth;
    }
}
