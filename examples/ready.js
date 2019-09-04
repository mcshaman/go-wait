const EventEmitter = require('events')
const {spawn} = require('child_process')
const readline = require('readline')

readline.emitKeypressEvents(process.stdin)

module.exports = pArgs => {
	const eventEmitter = new EventEmitter()
	const timedProcess = spawn('node', [pArgs[0]])

	process.nextTick(() => {
		eventEmitter.emit('addProcess', timedProcess, pArgs[0])
	})

	function keypressHandler(pKey, pData) {
		if (pData.ctrl && pData.name === 'c') {
			timedProcess.kill()
		}
	}
	
	const originalRawMode = process.stdin.isRaw
	process.stdin.setRawMode(true)
	process.stdin.on('keypress', keypressHandler)

	timedProcess.on('exit', () => {
		eventEmitter.emit('ready')
		process.stdin.off('keypress', keypressHandler)
		process.stdin.setRawMode(originalRawMode)
		process.stdin.unref()

		const infinateProcess = spawn('node', [pArgs[1]])
		eventEmitter.emit('addProcess', infinateProcess, pArgs[1])
	})

	return eventEmitter
}
