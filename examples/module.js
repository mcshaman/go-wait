const {spawn} = require('child_process')

module.exports = spawn('echo', ['Hello', 'world!'], {stdio: 'pipe'})