const andOptionName = process.env.ANDTNEN_AND || 'and'
const thenOptionName = process.env.ANDTNEN_THEN || 'then'

const thenFlag = `--${thenOptionName}`
const andFlag = `--${andOptionName}`

function splitByFlag(pArgs, pFlag) {
	const groups = [[]]
	for (const arg of pArgs) {
		if (arg === pFlag) {
			groups.push([])
		} else {
			groups[groups.length - 1].push(arg)
		}
	}
	return groups
}

function promiseForEach(pArray, pPromiseCallback) {
	function recursivePromise(pIndex, pArray, pPromiseCallback) {
		const arrayLenth = pArray.length
		if (pIndex < arrayLenth) {
			return pPromiseCallback(pArray[pIndex], pIndex, pArray)
				.then(() => {
					return recursivePromise(pIndex + 1, pArray, pPromiseCallback)
				})
		}
		return Promise.resolve()
	}
	return recursivePromise(0, pArray, pPromiseCallback)
}

module.exports = function andthenHandler(pCommand, pContext) {
	const args = pCommand.slice(1)
	const sequence = splitByFlag(args, thenFlag).map(pSteps => splitByFlag(pSteps, andFlag))
	return promiseForEach(sequence, pCommands => {
		const promises = pCommands.map(pCommand => {
			return pContext.call(pCommand)
		})
		return Promise.all(promises)
	})
}