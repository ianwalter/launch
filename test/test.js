import test from 'ava'
import execaHelper from '@ianwalter/execa-helper'
import got from 'got'

const withCli = execaHelper('./index.js')

test('process runs in the background', withCli, async (t, cli) => {
  const name = 'test/fixtures/cli.js'
  const { stdout } = await cli(name)
  t.log(stdout)
  t.true(stdout.includes(`Launched ${name} on process`))
  // const { body } = await got(stdout)
  // t.is(body, 'Hello World!')
  // await cli('--kill')
})
