import { expect, use } from 'chai'
import { solidity } from 'ethereum-waffle'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address'
import { utils, BigNumberish } from 'ethers'
import * as circomlib from 'circomlib'
import {
  AccumulateQueueL5D2,
  AccumulateQueueL5D2__factory as AccumulateQueueL5D2Fx,
  LibHashPoseidonL5,
  LibHashPoseidonL5__factory as LibHashPoseidonL5Fx,
  LibZeroPoseidonL5D2,
  LibZeroPoseidonL5D2__factory as LibZeroPoseidonL5D2Fx,
} from '../../../typechain'

use(solidity)

const poseidon = (inputs: BigNumberish[]): string => {
  const hash = circomlib
    .poseidon(inputs.map((input) => BigInt(input.toString())))
    .toString(16)
  return utils.hexZeroPad(
    Buffer.from(hash.length % 2 ? `0${hash}` : hash, 'hex'),
    32,
  )
}

describe('AccumulateQueueL5D2', () => {
  let [deployer]: Array<SignerWithAddress> = []

  let libHash: LibHashPoseidonL5
  let libZero: LibZeroPoseidonL5D2
  let accumulateQueueL5D2: AccumulateQueueL5D2

  beforeEach(async () => {
    ;[deployer] = await ethers.getSigners()
    if (!libHash) {
      libHash = await new LibHashPoseidonL5Fx(deployer).deploy()
      expect(libHash.address).to.properAddress
    }
    if (!libZero) {
      libZero = await new LibZeroPoseidonL5D2Fx(deployer).deploy()
      expect(libZero.address).to.properAddress
    }
    accumulateQueueL5D2 = await new AccumulateQueueL5D2Fx(
      {
        __$0d4cf1018bdd893b930ae72402afe3de5f$__: libHash.address,
        __$fe58bea150b89ba4cbe024e03f5b600d42$__: libZero.address,
      },
      deployer,
    ).deploy()
    expect(accumulateQueueL5D2.address).to.properAddress
  })

  it('should merge to depth 1', async () => {
    await [...Array(5)].reduce(
      (p) => p.then(() => accumulateQueueL5D2.enqueue(1)),
      Promise.resolve(),
    )
    expect((await accumulateQueueL5D2.getLeaf(1, 0)).toHexString()).to.eq(
      poseidon([...Array(5)].map(() => 1)),
    )
  })

  it('should merge to depth 2 and collect to roots', async () => {
    await [...Array(25)].reduce(
      (p) => p.then(() => accumulateQueueL5D2.enqueue(1)),
      Promise.resolve(),
    )
    expect((await accumulateQueueL5D2.getLeafSize()).toNumber()).to.eq(0)
    const depth1 = poseidon([...Array(5)].map(() => 1))
    expect((await accumulateQueueL5D2.getRoot(0)).toHexString()).to.eq(
      poseidon([...Array(5)].map(() => depth1)),
    )
  })

  it('should fill to depth 2 and collect to roots', async () => {
    await [...Array(3)].reduce(
      (p) => p.then(() => accumulateQueueL5D2.enqueue(1)),
      Promise.resolve(),
    )
    expect((await accumulateQueueL5D2.getLeafSize()).toNumber()).to.eq(3)
    await accumulateQueueL5D2.fill()
    expect((await accumulateQueueL5D2.getLeafSize()).toNumber()).to.eq(0)
    const depth0Zero =
      '8370432830353022751713833565135785980866757267633941821328460903436894336785'
    const depth1Zero = poseidon([...Array(5)].map(() => depth0Zero))
    const depth1 = poseidon([
      ...[...Array(3)].map(() => 1),
      depth0Zero,
      depth0Zero,
    ])
    expect((await accumulateQueueL5D2.getRoot(0)).toHexString()).to.eq(
      poseidon([depth1, ...[...Array(4)].map(() => depth1Zero)]),
    )
  })
})
