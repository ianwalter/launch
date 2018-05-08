#!/usr/bin/env node
const { dirname, join, basename, extname } = require('path')
const { createWriteStream } = require('fs')

const execa = require('execa')
const meow = require('meow')
const Conf = require('conf')
const readPkgUp = require('read-pkg-up')
const fkill = require('fkill')
const { green, red } = require('chalk')

// Create the config instance used to save process information.
const config = new Conf()

async function launch () {
  try {
    // Create a command-line interface to control the application.
    const cli = meow(`
      Usage
        $ launch <file?>

      Options
        --kill, -k  Kill process

      Examples
        > npx launch
        🚀 Launched server on process 12856!
    `, {
      flags: {
        kill: { type: 'boolean', alias: 'k' }
      }
    })

    // Get parent's package.json.
    const { pkg, path } = await readPkgUp()

    if (cli.flags.kill) {
      // Get the process information by the paren'ts project name.
      const { target, pid } = config.get(pkg.name) || {}

      if (pid) {
        // Kill the process.
        await fkill(pid)

        // Delete the process information.
        config.delete(pkg.name)

        // Inform the user that the process has been killed.
        console.log(red(`\n  💥 Killed ${target} on process ${pid}!`))
      } else {
        console.log(red('\n  🚫 No process to kill.'))
      }
    } else {
      // Set the target to a file specified on the command line or the parent's
      // package.json main value.
      const target = cli.input[0] || pkg.main

      // Allow the log's name and path to be customized in the project's
      // package.json under the "launch" key.
      const {
        logName = `${basename(target, extname(target))}.log`,
        logPath = dirname(path)
      } = pkg.launch || {}

      // Create a WriteStream for the log file and wait for it to be opened.
      const logStream = createWriteStream(join(logPath, logName))
      logStream.on('open', () => {
        // Ignore stdin and direct stdout and stderr to write to the log stream.
        const opts = { detached: true, stdio: ['ignore', logStream, logStream] }

        // Start the process and extract it's process ID.
        const proc = execa('node', [target], opts)

        // Instruct the current process to not wait for the subprocess to exit.
        proc.unref()

        // Save the process information keyed by the parent's project name.
        config.set(pkg.name, { target, pid: proc.pid })

        // Inform the user that the process has been launched.
        console.log(green(`\n  🚀 Launched ${target} on process ${proc.pid}!`))
      })
    }
  } catch (err) {
    console.error(err)
  }
}

launch()
