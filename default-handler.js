const {spawn} = require('child_process')

module.exports = function resolveDefaultHandler(pLogProcess) {
	return function defaultHandler(pCommand) {
		const commandPath = pCommand[0]
		const args = pCommand.slice(1)
		const childProcess = spawn(commandPath, args, {stdio: ['ignore', 'pipe', 'pipe']})
		pLogProcess.addProcess(childProcess, commandPath)
		return new Promise(pResolve => {
			childProcess.on('exit', () => {
				pLogProcess.removeProcess(childProcess)
				pResolve()
			})
		})
	}
}