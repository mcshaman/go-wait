const chalk = require('chalk')
const readline = require('readline')

const DEFAULT_COLOURS = [
	'greenyellow',
	'dodgerblue',
	'hotpink',
	'gold',
	'lightseagreen',
]

module.exports = function LogProcess(pColours) {
	const processes = new Map()
	let prefixSize = 0
	let colourIndex = 0
	const colours = pColours || DEFAULT_COLOURS

	return {
		addProcess(pProcess, pName) {
			processes.set(pProcess, pName)

			const nameLength = pName.length
			prefixSize = prefixSize > nameLength ? prefixSize : nameLength

			const colour = colours[colourIndex]
			const format = chalk.bold.inverse.keyword(colour)

			const stdout = readline.createInterface({
				input: pProcess.stdout,
				terminal: true,
			})
			stdout.on('line', pLine => {
				const prefix = ` ${pName.padStart(prefixSize, ' ')} `
				process.stdout.write(`${format(prefix)} ${pLine}\n`)
			})

			const stderr = readline.createInterface({
				input: pProcess.stderr,
				terminal: true,
			})
			stderr.on('line', pLine => {
				const prefix = ` ${pName.padStart(' ')} `
				process.stdout.write(`${format(prefix)} ${pLine}\n`)
			})

			colourIndex = (colourIndex + 1) % colours.length
		},
		removeProcess(pProcess) {
			processes.delete(pProcess)

			prefixSize = Array.from(processes.entries).reduce((pPrefixSize, [key, value]) => {
				return value > pPrefixSize ? value : pPrefixSize
			}, 0)
		}
	}
}
