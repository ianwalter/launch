#!/usr/bin/env node
const { dirname, join, basename, extname } = require('path')
const { createWriteStream, lstatSync } = require('fs')
const { debuglog } = require('util')

const execa = require('execa')
const meow = require('meow')
const Conf = require('conf')
const readPkgUp = require('read-pkg-up')
const fkill = require('fkill')
const { green, red } = require('chalk')

// Create the config instance used to save process information.
const config = new Conf()

const debug = debuglog('launch')

async function launch () {
  try {
    // Create a command-line interface to control the application.
    const cli = meow(`
      Usage
        launch <file?>

      Option
        --kill, -k  Kill process

      Example
        ❯ npx launch
        🚀 Launched server on process 12856!
    `, {
      flags: {
        kill: { type: 'boolean', alias: 'k' }
      }
    })

    // Get parent's package.json.
    const { pkg, path } = await readPkgUp()

    // Determine the name associated with the process from the package.json
    // file or fallback to the CLI input.
    const name = pkg.name || cli.input[0]

    if (cli.flags.kill) {
      // Get the process information by the paren'ts project name.
      const { target, pid } = config.get(name) || {}

      if (pid) {
        // Kill the process.
        await fkill(pid)

        // Delete the process information.
        config.delete(name)

        // Inform the user that the process has been killed.
        console.log(red(`\n  💥 Killed ${target} on process ${pid}!`))
      } else {
        console.error(red('\n  🚫 No process to kill.'))
        process.exit(1)
      }
    } else {
      // Set the target to a file specified on the command line or the parent's
      // package.json main value.
      const target = cli.input[0] || pkg.main || null

      // Allow the log's name and path to be customized in the project's
      // package.json under the "launch" key.
      const {
        logName = `${name}.log`,
        logPath = dirname(path)
      } = pkg.launch || {}

      // Create a WriteStream for the log file and wait for it to be opened.
      const logStream = createWriteStream(join(logPath, logName))
      logStream.on('open', () => {
        // Ignore stdin and direct stdout and stderr to write to the log stream.
        const opts = { detached: true, stdio: ['ignore', logStream, logStream] }

        // Run node <file> as the default command.
        let bin = 'node'
        let params = [target]

        // If the target is not a file, try to determine the command to run
        // from the input or the start script in the package.json.
        try {
          lstatSync(target).isFile()
        } catch (err) {
          if (cli.input.length) {
            bin = cli.input.shift()
            params = cli.input
          } else if (pkg.scripts && pkg.scripts.start) {
            const start = pkg.scripts.start.split(' ')
            bin = start.shift()
            params = start
          } else {
            console.error(err)
            console.error(red(`\n  🤔 Can't determine what to launch.`))
            process.exit(1)
          }
        }

        // Start the process and extract it's process ID.
        debug('Command: %s %s', bin, params)
        const proc = execa(bin, params, opts)

        // Instruct the current process to not wait for the subprocess to exit.
        proc.unref()

        // Save the process information keyed by the parent's project name.
        config.set(name, { target, pid: proc.pid })

        // Inform the user that the process has been launched.
        console.log(green(`\n  🚀 Launched ${name} on process ${proc.pid}!`))
      })
    }
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

launch()
