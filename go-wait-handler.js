const WAIT_FLAG = `[WAIT]`

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

module.exports = function goWaitHandler(pCommand, pContext) {
	const args = pCommand.slice(1)
	const sequence = splitByFlag(args, WAIT_FLAG).map(pSteps => splitByFlag(pSteps, pCommand[0]))

	return promiseForEach(sequence, pCommands => {
		const promises = pCommands.map(pCommand => {
			return pContext.call(pCommand)
		})
		return Promise.all(promises)
	})
}