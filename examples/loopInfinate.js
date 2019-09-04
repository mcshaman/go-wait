const {stripIndent} = require('common-tags')

let i = 0
const interval = setInterval(() => {
	if (i++) {
		console.log(i)
	} else {
		console.log(stripIndent`
			-----------------
			== STARTING UP ==
			-----------------
		`)
	}
}, 1000)