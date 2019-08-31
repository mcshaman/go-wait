const {spawn} = require('child_process')
const readline = require('readline')

readline.emitKeypressEvents(process.stdin)

module.exports = pArgs => {
	const nodeProcess = spawn('node', pArgs)

	function keypressHandler(pKey, pData) {
		if (pData.ctrl && pData.name === 'c') {
			nodeProcess.kill()
		}
	}
	
	const originalRawMode = process.stdin.isRaw
	process.stdin.setRawMode(true)
	process.stdin.on('keypress', keypressHandler)

	nodeProcess.on('exit', () => {
		process.stdin.off('keypress', keypressHandler)
		process.stdin.setRawMode(originalRawMode)
		process.stdin.unref()
	})

	return nodeProcess
}
