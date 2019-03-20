import test from 'ava'
import execaHelper from '@ianwalter/execa-helper'
import got from 'got'

const withCli = execaHelper('./index.js')

test('process runs in the background', withCli, async (t, cli) => {
  try {
    const options = { env: { TEST_SERVER_PORT: 9876 } }
    const { stdout } = await cli('--name', 'cli', 'test/fixtures/cli.js', options)
    const msgParts = stdout.split(' ')
    t.true(parseInt(msgParts.pop(), 10) > 0)
    t.is(msgParts.join(' '), '🚀 Launched cli on process')
    const { body } = await got('http://localhost:9876')
    t.is(body, 'Hello World!')
  } finally {
    await cli('--name', 'cli', '--kill', 'true')
  }
})

test('pid output', withCli, async (t, cli) => {
  try {
    const options = { env: { TEST_SERVER_PORT: 9877 } }
    await cli('--name', 'cli', 'test/fixtures/cli.js', options)
    const { stdout } = await cli('--name', 'cli', '--pid')
    t.true(parseInt(stdout, 10) > 0)
  } finally {
    await cli('--name', 'cli', '--kill', 'true')
  }
})
