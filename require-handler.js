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
				pLogProcess(modulePath, module)
			}

			return new Promise(pResolve => {
				module.on('ready', () => {
					pResolve()
				})
				module.on('exit', () => {
					pResolve()
				})
			})
		}
		if (module instanceof EventEmitter) {
			module.on('addProcess', (pName, pProcess) => {
				pLogProcess(pName, pProcess)
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