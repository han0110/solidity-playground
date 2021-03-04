import { task } from 'hardhat/config'
import { TASK_COMPILE } from 'hardhat/builtin-tasks/task-names'
import codegenPoseidon from '../utils/codegen-poseidon'

task(TASK_COMPILE, 'Extends compile for codegen', async (_, __, runSuper) => {
  await runSuper()
  await codegenPoseidon([1, 2, 3, 4, 5])
})
