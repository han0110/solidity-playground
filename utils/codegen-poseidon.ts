import { readFileSync, writeFileSync } from 'fs'
import { utils } from 'ethers'
import { tsGenerator, TFileDesc } from 'ts-generator'
import { parse, RawAbiDefinition } from 'typechain'
import TypechainEthers from '@typechain/ethers-v5'
import * as poseidonGenContract from 'circomlib/src/poseidon_gencontract'

const fnSig = (fn: string): string => {
  return utils.keccak256(Buffer.from(fn)).substr(2, 8)
}

const replaceFnSig = (inputLength: number, code: string) => {
  const oldUint256FnSig = fnSig(`poseidon(uint256[${inputLength}])`)
  const oldBytes32FnSig = fnSig(`poseidon(bytes32[${inputLength}])`)
  const newUint256FnSig = fnSig(`hash(uint256[${inputLength}])`)
  const newBytes32FnSig = fnSig(`hash(bytes32[${inputLength}])`)
  return code
    .replace(new RegExp(oldUint256FnSig, 'g'), newUint256FnSig)
    .replace(new RegExp(oldBytes32FnSig, 'g'), newBytes32FnSig)
}

const codegenPoseidon = async (inputLengths: number[]): Promise<void> => {
  const contracts = inputLengths.map((inputLength) => {
    const name = `LibHashPoseidonL${inputLength}`
    const bytecode = replaceFnSig(
      inputLength,
      poseidonGenContract.createCode(inputLength),
    )
    const abi = poseidonGenContract.generateABI(inputLength)
    abi[0].name = 'hash'
    abi[1].name = 'hash'
    const contract = parse(abi as RawAbiDefinition[], name)
    return {
      name,
      abi,
      bytecode,
      contract,
    }
  })

  const cwd = `${__dirname}/..`
  const outDir = 'typechain'
  const typechainGenerator = new TypechainEthers({
    cwd,
    rawConfig: {
      files: __filename,
      outDir,
    },
  })

  await tsGenerator(
    { cwd },
    {
      name: typechainGenerator.name,
      logger: typechainGenerator.logger,
      beforeRun: () => void 0,
      afterRun: () => {
        const indexFile = `${cwd}/${outDir}/index.ts`
        const indexFileLines = readFileSync(indexFile, 'utf-8').split('\n')
        const middleIndex = indexFileLines.findIndex((line) => line === '')
        contracts.forEach(({ name }, i) => {
          indexFileLines.splice(
            middleIndex + i,
            0,
            `export type { ${name} } from './${name}'`,
          )
          indexFileLines.splice(
            indexFileLines.length - 1,
            0,
            `export { ${name}__factory } from './factories/${name}__factory'`,
          )
        })
        writeFileSync(indexFile, indexFileLines.join('\n'))
      },
      ctx: typechainGenerator.ctx,
      transformFile: () =>
        contracts.reduce(
          (files, { abi, bytecode, contract }) => [
            ...files,
            typechainGenerator.genContractFactoryFile(contract, abi, {
              bytecode,
            }),
            typechainGenerator.genContractTypingsFile(contract),
          ],
          Array<TFileDesc>(),
        ),
    },
  )
}

export default codegenPoseidon
