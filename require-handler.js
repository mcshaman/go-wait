const EventEmitter = require('events')
const {ChildProcess} = require('child_process')
const importFrom = require('import-from')

function getModule(pReferencePath, pModuleId, pArgs) {
	const module = importFrom(pReferencePath, pModuleId)
	if (typeof module === 'function') {
		return module(pArgs)
	}
	return module
}

module.exports = function resolveRequireHandler(pLogProcess) {
	return function requireHandler(pCommand) {
		const modulePath = pCommand[1]
		const args = pCommand.slice(2)
		const module = getModule(process.cwd(), modulePath, args)
		if (module instanceof ChildProcess) {
			if (module.stdout && module.stderr) {
				pLogProcess.addProcess(module, modulePath)
			}

			return new Promise(pResolve => {
				module.on('ready', () => {
					pLogProcess.removeProcess(module)
					pResolve()
				})
				module.on('exit', () => {
					pLogProcess.removeProcess(module)
					pResolve()
				})
			})
		}
		if (module instanceof EventEmitter) {
			module.on('addProcess', (pProcess, pName = 'unnamed') => {
				pLogProcess.addProcess(pProcess, pName)
			})
			return new Promise(pResolve => {
				module.on('ready', () => {
					pResolve()
				})
			})
		} else {
			return Promise.resolve(module)
		}
	}
}