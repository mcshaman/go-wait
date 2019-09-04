#!/usr/bin/env node
const captain = require('captain-call')
const logProcess = require('./logProcess')()
const defaultHandler = require('./default-handler')(logProcess)
const requireHandler = require('./require-handler')(logProcess)
const runHandler = require('./run-handler')
const andthenHandler = require('./andthen-handler')

const andthen = captain
	.add(defaultHandler)
	.add('require', requireHandler)
	.add('run', runHandler)
	.add('andthen', andthenHandler)

module.exports = andthen

if (require.main === module) {
	process.on('warning', pWarning => {
		if (process.env.NODE_ENV === 'development') {
			console.warn(pWarning)
		}
	})

	andthen.call(['andthen', ...process.argv.slice(2)])
}