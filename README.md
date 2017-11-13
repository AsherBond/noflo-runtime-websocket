NoFlo WebSocket Runtime [![Build Status](https://travis-ci.org/noflo/noflo-runtime-websocket.svg?branch=master)](https://travis-ci.org/noflo/noflo-runtime-websocket) [![Coverage Status](https://coveralls.io/repos/github/noflo/noflo-runtime-websocket/badge.svg?branch=master)](https://coveralls.io/github/noflo/noflo-runtime-websocket?branch=master)
====

WebSocket implementation of [FBP protocol](https://flowbased.github.io/fbp-protocol/) for NoFlo. Meant to be used as a library for actual runners like [noflo-nodejs](https://github.com/noflo/noflo-nodejs)

## Changes

* 0.9.1 (November 13 2017)
  - Improved payload normalization for errors and other non-serializable objects
  - Fixed regression with sending captured STDOUT messages
  - Exposed the `noflo-websocket-runtime` command to NPM bin
* 0.9.0 (November 6 2017)
  - NoFlo 1.x compatibility
  - Ported to ES6 class syntax
