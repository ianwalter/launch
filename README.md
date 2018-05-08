# launch
> A simple process manager used to run a Node.js application in the background

[![Npm page][npm-image]][npm-url]

## About

`launch` is useful when you want to run a long-running Node.js process in detached mode (background), want the output from the process directed to a log file, and want to be able to easily kill the process at a later stage. A common
use case would be running a Node.js server, running a test suite against the
running server, and then killing the server when the test suite has finished.

## Installation

```fish
❯ npm install @appjumpstart/launch --save
```

## Usage

Launch the process:
```fish
❯ npx launch

  🚀 Launched server on process 40765!
```

Kill the process:
```fish
❯ npx launch --kill

  💥 Killed server on process 40765!
```

## Acknowledgement

All dependencies created by the amazing [Sindre Sorhus](https://github.com/sindresorhus).

&nbsp;

ISC &copy; [Ian Walter](https://iankwalter.com)

[npm-image]: https://img.shields.io/npm/v/@appjumpstart/launch.svg
[npm-url]: https://www.npmjs.com/package/@appjumpstart/launch
