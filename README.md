# launch
> A simple process manager used to run a Node.js application in the background

[![Npm page][npm-image]][npm-url]
[![Build status][build-image]][build-url]
[![appjumpstart chat][gitter-image]][gitter-url]

## About

`launch` is useful when you want to run a long-running Node.js process in
detached mode (background), want the output from the process directed to a log
file, and want to be able to easily kill the process at a later stage. A common
use case would be running a Node.js server, running a test suite against the
running server, and then killing the server when the test suite has finished.

## Installation

```console
npm install @appjumpstart/launch --save
```

## Usage

```console
launch <file|command?>
```

Launch the default command (main or scripts.start in package.json):
```console
❯ npx launch

  🚀 Launched server on process 40765!
```

Kill the process:
```console
❯ npx launch --kill

  💥 Killed server on process 40765!
```

## Acknowledgement

All dependencies created by the amazing
[Sindre Sorhus](https://github.com/sindresorhus).

&nbsp;

<a href="https://github.com/appjumpstart">
  <img
    alt="AppJumpstart"
    src="https://appjumpstart.nyc3.digitaloceanspaces.com/assets/appjumpstart-transparent.png"
    height="50">
</a>

[npm-image]: https://img.shields.io/npm/v/@appjumpstart/launch.svg
[npm-url]: https://www.npmjs.com/package/@appjumpstart/launch
[build-image]: https://travis-ci.com/appjumpstart/launch.svg?branch=master
[build-url]: https://travis-ci.com/appjumpstart/launch
[gitter-image]: https://img.shields.io/gitter/room/appjumpstart/appjumpstart.svg
[gitter-url]: https://gitter.im/appjumpstart

