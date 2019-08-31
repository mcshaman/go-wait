const importFrom = require('import-from')
const shellQuote = require('shell-quote')

function getNested(pObject, pProperty, ...pRest) {
	if (pObject === undefined) {
		return undefined
	}
	if (pRest.length === 0 && pProperty in pObject) {
		return pObject[pProperty]
	}
	return getNested(pObject[pProperty], ...pRest)
}

module.exports = function runHandler(pCommand, pContext) {
	const scriptName = pCommand[1]
	if (!scriptName) {
		throw new Error('No script name argument supplied')
	}
	const package = importFrom(process.cwd(), './package.json')
	const script = getNested(package, 'scripts', scriptName)
	if (!script) {
		throw `npm script ${scriptName} not found`
	}
	const shellCommand = shellQuote.parse(script)
	return Promise.resolve(pContext.call(shellCommand))
}
