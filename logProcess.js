const chalk = require('chalk')

const colours = process.env.ANDTHEN_COLOURS || [
	'green',
	'blue',
	'magenta',
	'yellow',
	'cyan',
]

function pipeOutputs(pProcess, pFormat) {
	pProcess.stdout.on('data', pData => {
		process.stdout.write(pFormat(pData))
	})
	pProcess.stderr.on('data', pData => {
		process.stderr.write(pFormat(pData))
	})
}

let index = 0

module.exports = function logProcess(pProcess) {
	const colour = colours[index]
	const format = chalk[colour]
	pipeOutputs(pProcess, format)
	index = (index + 1) % colours.length
}
