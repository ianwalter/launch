const createTestServer = require('@ianwalter/test-server')

async function run () {
  return new Promise(async (resolve, reject) => {
    try {
      const server = await createTestServer()
      server.use(ctx => (ctx.body = 'Hello World!'))
      console.log(server.url)
    } catch (err) {
      console.error(err)
      reject(err)
    }
  })
}

run()
