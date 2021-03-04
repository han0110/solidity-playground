declare module 'circomlib' {
  function poseidon(inputs: BigInt[]): BigInt
}

declare module 'circomlib/src/poseidon_gencontract' {
  import { JsonFragment } from '@ethersproject/abi'

  function generateABI(inputs: number): JsonFragment[]
  function createCode(inputs: number): string
}
