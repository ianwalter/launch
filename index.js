#!/usr/bin/env node
const { join } = require('path')

const execa = require('execa')
const meow = require('meow')
const Conf = require('conf')
const readPkgUp = require('read-pkg-up')
const chalk = require('chalk')
const fkill = require('fkill')

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
        // TODO: logs: { type: 'boolean', alias: 'l' },
        kill: { type: 'boolean', alias: 'k' }
      }
    })

    // Get parent's package.json.
    const { pkg } = await readPkgUp()

    // Set the target to a file specified on the command line or the parent's
    // package.json main value.
    const target = cli.input[0] || pkg.main

    if (cli.flags.kill) {
      // Get the process information by the paren'ts project name.
      const { target, pid } = config.get(pkg.name)

      // Kill the process.
      await fkill(pid)

      // Delete the process information.
      config.delete(pkg.name)

      // Inform the user what has been done.
      console.log(chalk.red(`💥 Killed ${target} on process ${pid}!`))
    } else {

      // Start the process and extract it's process ID.
      const proc = execa('node', [target], { detached: true, stdio: 'ignore' })

      //
      proc.unref()

      // Save the process information keyed by the parent's project name.
      config.set(pkg.name, { target, pid: proc.pid })

      // Inform the user what has been done.
      console.log(chalk.green(`🚀 Launched ${target} on process ${proc.pid}!`))
    }
  } catch (err) {
    console.error(err)
  }
}

launch()
