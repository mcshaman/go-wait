#!/usr/bin/env node
const EventEmitter = require('events')
const path = require('path')
const chalk = require('chalk')
const executeHandler = require('./executeHandler')
const requireHandler = require('./requireHandler')

const andPropertyName = process.env.ANDTNEN_AND || 'and'
const thenPropertyName = process.env.ANDTNEN_THEN || 'then'

const colours = ANDTHEN_COLOURS || [
	'green',
	'blue',
	'magenta',
	'yellow',
	'cyan',
]

commandHandlers = [
	executeHandler,
	requireHandler,
]

function pipeOutputs(pProcess, pFormat) {
	pProcess.stdout.on('data', pData => {
		process.stdout.write(pFormat(pData))
	})
	pProcess.stderr.on('data', pData => {
		process.stderr.write(pFormat(pData))
	})
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

function getHandler(pArg) {
	const handler = commandHandlers.find(({name}) => name === pArg)
	if (handler) {
		return handler
	}

	// Add error unable to find handler
	return require(path.resolve(pArg))
}

function initaliseCommand(pArgs, pProcessEventEmitter) {
	const handler = getHandler(pArgs[0])
	const args = pArgs.slice(1)
	const {validate, call} = handler
	if (validate) {
		validate(args)
	}
	return function promiseCall() {
		return new Promise(pResolve => {
			if (call) {
				const commandEventEmitter = new EventEmitter()
				commandEventEmitter.on('addProcess', pProcess => {
					pProcessEventEmitter.emit('add', pProcess)
				})
				commandEventEmitter.on('done', () => {
					pResolve()
				})
				call(args, commandEventEmitter)
			} else {
				pResolve()
			}
		})
	}
}

function formatOutputFactory(pColours) {
	let index = 0
	return function formatOutput(pProcess) {
		const colour = pColours[index]
		const format = chalk[colour]
		pipeOutputs(pProcess, format)
		index = (index + 1) % pColours.length
	}
}

const formatOutput = formatOutputFactory(colours)

const thenFlag = `--${thenPropertyName}`
const andFlag = `--${andPropertyName}`
const argv = process.argv.slice(2)
const rawSteps = splitByFlag(argv, thenFlag).map(pSteps => splitByFlag(pSteps, andFlag))

const processEventEmitter = new EventEmitter()
processEventEmitter.on('add', formatOutput)

const steps = rawSteps.map(pRawStep => {
	const rawCommands = pRawStep
	return rawCommands.map(pRawCommand => {
		return initaliseCommand(pRawCommand, processEventEmitter)
	})
})

promiseForEach(steps, pStep => {
	const commands = pStep
	const promises = commands.map(pCommand => pCommand())
	return Promise.all(promises)
})