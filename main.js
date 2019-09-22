#!/usr/bin/env node
const captain = require('captain-call')
const logProcess = require('./logProcess')()
const defaultHandler = require('./default-handler')(logProcess)
const requireHandler = require('./require-handler')(logProcess)
const runHandler = require('./run-handler')
const goWaitHandler = require('./go-wait-handler')

const package = require('./package.json')
const binCommands = Object.keys(package.bin)
const goWaitCommand = binCommands[0]

const goWait = captain
	.add(defaultHandler)
	.add('[REQUIRE]', requireHandler)
	.add('[RUN]', runHandler)
	.add(goWaitCommand, goWaitHandler)

module.exports = goWait

if (require.main === module) {
	process.on('warning', pWarning => {
		if (process.env.NODE_ENV === 'development') {
			console.warn(pWarning)
		}
	})

	goWait.call([goWaitCommand, ...process.argv.slice(2)])
}