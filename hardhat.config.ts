import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import '@ethereum-waffle/chai'
import 'hardhat-typechain'
import './tasks/codegen'
import { HardhatUserConfig } from 'hardhat/config'

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.7.6',
      },
    ],
  },
  mocha: {
    timeout: 30000,
  },
}

export default config
