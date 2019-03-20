#!/usr/bin/env node
const { dirname, basename, resolve } = require('path')
const { createWriteStream, lstatSync, readFileSync } = require('fs')
const { debuglog } = require('util')

const execa = require('execa')
const meow = require('meow')
const Conf = require('conf')
const readPkgUp = require('read-pkg-up')
const fkill = require('fkill')
const { green, red, cyan } = require('chalk')
const processExists = require('process-exists')
const npmShortName = require('@ianwalter/npm-short-name')

// Create the config instance used to save process information.
const config = new Conf()

// Create a launch-namespaced debug logger.
const debug = debuglog('launch')

async function launch () {
  try {
    // Create a command-line interface to control the application.
    const cli = meow(
      `
        Usage
          launch <file?>

        Option
          --name, -n  Process name
          --kill, -k  Kill process
          --pid, -p   Output process ID

        Example
          ❯ npx launch
          🚀 Launched server on process 12856!
      `,
      {
        flags: {
          name: { type: 'string', alias: 'n' },
          kill: { type: 'string', alias: 'k' },
          pid: { type: 'boolean', alias: 'p' }
        }
      }
    )

    // Get parent's package.json.
    const {
      pkg = {},
      path = process.cwd()
    } = await readPkgUp()

    // Determine the name associated with the process from the package.json
    // file or fallback to the CLI input.
    const name = cli.flags.name ||
      npmShortName(pkg.name) ||
      basename(cli.input[0])

    // Allow the path to the log file to be customized in the project's
    // package.json under the "launchLog" key.
    const logPath = resolve(pkg.launchLog || dirname(path), `${name}.log`)

    let info
    if (cli.flags.pid || cli.flags.kill !== undefined) {
      // Get the process information by the paren'ts project name.
      info = config.get(name) || {}
    }

    if (cli.flags.pid) {
      console.log(info.pid)
    } else if (cli.flags.kill !== undefined) {
      if (info.pid) {
        let timeElapsed = 0
        let checkInterval = setInterval(async () => {
          const launchProcessExists = await processExists(info.pid)
          const timeout = timeElapsed >= 4000 // 4 seconds

          if (launchProcessExists || timeout) {
            // Stop the check process.
            clearInterval(checkInterval)

            // Delete the process information.
            config.delete(name)
          }

          if (launchProcessExists) {
            // Kill the process.
            await fkill(info.pid)

            // Inform the user that the process has been killed.
            console.log(red(`💥 Killed ${info.target} on process ${info.pid}!`))
          } else if (timeout) {
            // Inform the user that the process was not found.
            console.error(red(`🚫 Process ${info.pid} not found after 4s.`))

            // Output the log contents to make debugging easier when the process
            // exits immediately.
            const log = readFileSync(logPath, 'utf8')
              .split('\n')
              .map(line => `     ${line}`)
              .join('\n')
            console.log(cyan(`📝 ${logPath}\n\n${log}`))

            // Exit with error code.
            process.exit(1)
          } else {
            //
            timeElapsed += 100
          }
        }, 100)
      } else if (cli.flags.kill) {
        console.error(red('🚫 No process to kill.'))
        process.exit(1)
      }
    } else {
      // Set the target to a file specified on the command line or the parent's
      // package.json main value.
      const target = cli.input[0] || pkg.main || null

      // Create a WriteStream for the log file and wait for it to be opened.
      const logStream = createWriteStream(logPath)
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
            console.error(red(`🤔 Can't determine what to launch.`))
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
        console.log(green(`🚀 Launched ${name} on process ${proc.pid}!`))
      })
    }
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

if (module.parent) {
  module.exports = { launch }
} else {
  launch()
}
