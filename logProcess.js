const chalk = require('chalk')

const colours = process.env.ANDTHEN_COLOURS || [
	'greenyellow',
	'dodgerblue',
	'hotpink',
	'gold',
	'lightseagreen',
]

let index = 0

module.exports = function logProcess(pName, pProcess) {
	const colour = colours[index]
	const format = chalk.bold.inverse.keyword(colour)
	const prefix = ` ${pName} `
	
	pProcess.stdout.on('data', pData => {
		process.stdout.write(`${format(prefix)} ${pData}`)
	})
	pProcess.stderr.on('data', pData => {
		process.stdout.write(`${format(prefix)} ${pData}`)
	})

	index = (index + 1) % colours.length
}
