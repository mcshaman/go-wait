let i = 0
const interval = setInterval(() => {
	console.log(i)
	if (i++ >= 10) {
		clearInterval(interval)
	}
}, 1000)