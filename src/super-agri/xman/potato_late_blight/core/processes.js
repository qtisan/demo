/**
 * Created by qtisa on 2017/6/19.
 */

const { XPLBLogger: logger } = require('../../../utils');
const Random = require('mockjs').Random;
const EventEmitter = require('events');
const { fork } = require('child_process');
const PROCESS_NUM = require('../config').get('process_num');

// payload sent to child process: {command, message}, command: initial/execute/resume/converge
// payload replied from child process: {status, message}, status: ready/error/finish/halt/warn/report
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
			result: [],
			warns: []
		};
		this.finishedBatches = [];
		let i = PROCESS_NUM;
		while (i--) {
			let child = fork(script);
			this.pool.push(child);
			const that = this;
			child.on('message', function ({status, data}) {
				const payload = {data, batch: that.currentBatch, child: this};
				switch (status) {
					case 'ready':
						logger.info(`* process[${this.pid}] ready for dispatching task...`);
						that.emit(`childReady`, payload);
						that.dispatch(this);
						break;
					case 'error':
						that.emit(`childError`, payload);
						that.currentBatch.errors.push(data);
						break;
					case 'finish':
						that.finish(data, this);
						break;
					case 'warn':
						that.emit(`childWarn`, payload);
						that.currentBatch.warns.push(data);
						break;
					case 'halt':
						that.emit(`childHalt`, payload);
						that.handleHalt(data, (message) => {
							this.send({command: 'resume', message: message});
						});
						break;
					case 'report':
						that.emit('childReport', payload);
						let result = that.currentBatch.result;
						result.push({pid: this.pid, data});
						result.length == that.count() && that.finishBatch();
						break;
					default:
						logger.warn('not recognize message.');
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

	count () {
		return this.pool.length;
	}

	execute (message, child) {
		const num = this.pool.length;
		let i = Number.isInteger(child) ? child : Math.floor(Math.random() * num);
		let _child = child.pid ? child : this.pool[i % num];
		_child.send({command: 'execute', message: message});
	}

	dispatch (child) {
		let collection = this.currentBatch.collection;
		if (collection.length > this.currentBatch.index) {
			let message = collection[this.currentBatch.index ++];
			this.emit('singleStart', {data: message, batch: this.currentBatch, child});
			this.execute(message, child);
		}
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
				id: batch.id, count: batch.collection.length, readyProcessCount: 0, index: 0, result: [],
				errors: [], finished: [], warns: [], data: initialData, collection: batch.collection
			});
			initialData.batchId = batch.id;
			this.emit('batchStart', {initialData, batch: this.currentBatch});
			this.pool.forEach(child => child.send({command: 'initial', message: initialData}));
		}
	}

	finish (data, child) {
		// this.currentBatch.finished.push(data); // TODO: this costs memories.
		this.currentBatch.finished.push(null);
		this.emit('singleFinish', {data, batch: this.currentBatch, child});
		let finishedCount = this.currentBatch.finished.length + this.currentBatch.errors.length;
		const finished = finishedCount == this.currentBatch.count;
		logger.info(`${finishedCount}/${this.currentBatch.count} finished.`);
		if (finished) {
			logger.info(`batch[${this.currentBatch.id}] with ${this.currentBatch.count} tasks must be finished, now converging...`);
			this.pool.forEach(c => c.send({command: 'converge'}));
		}
		else {
			this.dispatch(child);
		}
		return finished;
	}

	finishBatch () {
		this.emit('batchFinish', {result: this.currentBatch.result, batch: this.currentBatch});
		this.finishedBatches.push(this.currentBatch);
		this.status = 'free';
		this.options.continuously && this.runBatch();
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

