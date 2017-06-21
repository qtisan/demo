/**
 * Created by qtisa on 2017/6/19.
 */

const { logger } = require('../../../utils');
const Random = require('mockjs').Random;
const EventEmitter = require('events');
const { fork } = require('child_process');

const CPU_NUM = require('os').cpus().length;

// payload sent to child process: {command, message}, command: initial/execute/resume
// payload replied from child process: {status, message}, status: ready/error/finish/halt
class ProcessPool extends EventEmitter {

	constructor (script, { continuously }) {
		super();
		this.pool = [];
		this.queue = [];
		this.status = 'free'; // free, busy
		this.options = {
			continuously
		};
		this.currentBatch = {
			id: '',
			count: 0,
			index: 0,
			readyProcessCount: 0,
			errors: [],
			finished: [],
			warns: []
		};
		this.finishedBatches = [];
		let i = CPU_NUM;
		while (i--) {
			let child = fork(script);
			this.pool.push(child);
			const that = this;
			child.on('message', function ({status, data}) {
				switch (status) {
					case 'ready':
						logger.info(`* process[${this.pid}] ready for dispatching task...`);
						that.emit(`readyChild`, {data, batch: that.currentBatch, child: this});
						that.dispatch(this);
						break;
					case 'error':
						that.emit(`errorChild`, {data, batch: that.currentBatch, child: this});
						that.currentBatch.errors.push(data);
						break;
					case 'finish':
						that.judgeAndFinishBatch(data, this);
						break;
					case 'warn':
						that.emit(`warnChild`, {data, batch: that.currentBatch, child: this});
						that.currentBatch.warns.push(data);
						break;
					case 'halt':
						that.emit(`haltChild`, {data, batch: that.currentBatch, child: this});
						that.handleHalt(data, (message) => {
							this.send({command: 'resume', message: message});
						});
						break;
					default:
						console.log('not recognize message.');
						break;
				}
			});
		}
	}

	// TODO: while child process halt logic needed, fill it.
	handleHalt (data, callback) {
		callback.call(this, null);
	}

	isFree () {
		return this.status == 'free';
	}

	execute (message, child) {
		const num = this.pool.length;
		let i = Number.isInteger(child) ? child : Math.floor(Math.random() * num);
		let _child = child.pid ? child : this.pool[i % num];
		_child.send({command: 'execute', message: message.el});
	}

	dispatch (child) {
		let collection = this.currentBatch.collection;
		if (collection.length > this.currentBatch.index) {
			const message = {el: collection[this.currentBatch.index ++]};
			this.emit('startSingle', {data: message.el, child, index: this.currentBatch.index});
			this.execute(message, child);
		}
	}

	count () {
		return this.pool.length;
	}

	createBatch (collection, data, id) {
		let _id = id || Random.guid();
		this.queue.push({collection, data, id: _id});
	}

	runBatch () {
		if (this.isFree() && this.queue.length) {
			this.status = 'busy';
			let batch = this.queue.shift();
			let initialData = batch.data;
			Object.assign(this.currentBatch, {
				id: batch.id, count: batch.collection.length, readyProcessCount: 0, index: 0,
				errors: [], finished: [], warns: [], data: initialData, collection: batch.collection
			});
			this.emit('startBatch', this.currentBatch);
			this.pool.forEach(child => child.send({command: 'initial', message: initialData}));
		}
	}

	judgeAndFinishBatch (data, child) {
		this.currentBatch.finished.push(data);
		this.emit('finishSingle', {data, batch: this.currentBatch, child});
		let finishedCount = this.currentBatch.finished.length + this.currentBatch.errors.length;
		const finished = finishedCount == this.currentBatch.count;
		logger.info(`${finishedCount}/${this.currentBatch.count} finished.`);
		if (finished) {
			logger.info(`batch[${this.currentBatch.id}] with ${this.currentBatch.count} tasks finished.`);
			this.status = 'free';
			this.emit('finishBatch', this.currentBatch);
			this.finishedBatches.push(this.currentBatch);
			this.options.continuously && this.runBatch();
		}
		else {
			this.dispatch(child);
		}
		return finished;
	}

	saveToCache () {}
	saveToFile () {}
	saveToDB () {}

	statisticErrors () {}
	statisticWarns () {}

}

// 创建进程池，运行子进程
const handleProcessPool = script => ({ continuously = true } = {}) => new ProcessPool(script, { continuously });

module.exports = { handleProcessPool };

