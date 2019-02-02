 import test from 'ava'
 import execaHelper from '@ianwalter/execa-helper'

 const withCli = execaHelper('./index.js')

 test('process runs in the background', withCli, async (t, cli) => {
   const { stdout } = await cli()
 })
