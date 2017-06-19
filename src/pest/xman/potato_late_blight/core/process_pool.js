/**
 * Created by qtisa on 2017/6/19.
 */


const { fork } = require('child_process');

const CPU_NUM = require('os').cpus().length * 2;

class ProcessPool {

	constructor (script) {
		this.pool = [];
		let i = CPU_NUM;
		while (i--) {
			this.pool.push(fork(script));
		}
	}

	dispatch (message, index) {
		const num = this.pool.length;
		let i = Number.isInteger(index) ? index : Math.floor(Math.random() * num);
		this.pool[i % num].send(message);
	}

	count () {
		return this.pool.length;
	}

}

// 创建进程池，运行子进程
const handleProcessPool = (script) => {
	return () => new ProcessPool(script);
};

module.exports = { handleProcessPool };

