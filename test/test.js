import test from 'ava'
import execaHelper from '@ianwalter/execa-helper'
import got from 'got'

const withCli = execaHelper('./index.js')

test('process runs in the background', withCli, async (t, cli) => {
  const { stdout } = await cli('--name', 'cli', 'test/fixtures/cli.js')
  const msgParts = stdout.split(' ')
  t.true(parseInt(msgParts.pop(), 10) > 0)
  t.is(msgParts.join(' '), '🚀 Launched cli on process')
  const { body } = await got('http://localhost:9876')
  t.is(body, 'Hello World!')
  await cli('--name', 'cli', '--kill')
})
