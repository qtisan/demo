/**
 * Created by qtisa on 2017/6/16.
 */
//
// class A {
// 	constructor(b){
// 		this.b = b;
// 	};
// }
// class B {
// 	constructor(a){
// 		this.a = a;
// 		console.log(a instanceof A);
// 	};
// }
//
// const a = new A();
// const b = new B(a);
// a.b = b;
//
// console.log();
//
// const moment = require('moment');
//
// let a = 100000;
// let c;
// console.time('int');
// while (a--) {
// 	c = moment().format('YYYYMMDD') == 20170617 && Math.floor(20170615093549 / 1000000).toString();
// }
// console.log(c);
// console.timeEnd('int');
//
// a = 100000;
// console.time('string');
// while (a--) {
// 	c = moment().format('YYYYMMDD') == '20170617' && '20170615093549'.slice(0, 8);
// }
// console.log(c);
// console.timeEnd('string');
//
//
// =>
// 20170615
// int: 372.269ms
// 20170615
// string: 385.273ms
//



//
// const {fork} = require('child_process');
// const join = require('path').join;
//
// console.log(`Master's pid is ${process.pid}`);
//
// const children = [];
// let i = 3;
// while (i--) {
// 	let child = fork(join(__dirname, './bb.js'));
// 	children.push(child);
// 	child.on('message', function (data) {
// 		console.log(data);
// 		console.log(`this === child: ${this === child}, pid: ${this.pid}`);
// 		((s)=>{s.f();})({f: () => {console.log(this.pid)}});
// 		// this.send({command: 'goon'});
// 		if (data.status == 'ok') {
// 			console.log('not halt.');
// 		}
// 	});
// }
//
// children.forEach(child => child.send('hello'));

//
// this === process: true
// this === child: true












//
//
// let i = 0;
// [1,2,3].forEach(n => console.log(`i++:${i++}, n:${n}`));
//


//not support.
// function good(message) {
// 	return () => console.log(message);
// }
//
// @good('it is good!')
// class A {
// 	hello() {
// 		this.message = 'hello is called.';
// 		console.log(this.message);
// 	}
// }
// const a = new A();

//
// let obj = { a: { b: 1 } };
// let { ...x } = obj;
// console.log(x);
// // error
//
// let obj = {a:1, b:2};
// let s = [...obj];
// console.log(s);
// // error
//
// let a, b;
// let obj = {a:1, b:2};
// ({a, b} = obj);
// console.log(`${a}+${b}`);
// // ok

//
//
// const f = ({a, b: {c, d}}) => {
// 	console.log({a, b, c, d});
// };
//
// f({a:1,b:{c:4,d:5}});
// //error
//
//
//

//
// let a = [{c:1}, {c:2}];
// let b = {c:3};
// a.forEach(s=>Object.assign(s, b));
//
// console.log(a);

//
//
//
// console.log(Object.keys({a:1,b:2}).length);

//
//
// Object.prototype.serialize = function () {
// 	return `Hello, ${this.name || 'lennon'}!`;
// };
// class A {
// 	constructor (name) { this.name = name; }
// }
//
// let a = new A('wang'), b = 'good', c = {}, d = [], e = 6;
//
// console.log(a.serialize());
// console.log(b.serialize());
// console.log(c.serialize());
// console.log(d.serialize());
// console.log(e.serialize());

//
// const {readFileSync} = require('../utils');
// console.log(readFileSync('${__dirname}/test/bb.js'));
//

//
// var twice = {
// 	apply (target, ctx, args) {
// 		return Reflect.apply(...arguments) * 2;
// 	}
// };
// function sum (left, right) {
// 	return left + right;
// }
// var proxy = new Proxy(sum, twice);
// console.log(proxy(1, 2));
// // ok
//


// const path  = require('path');
//
// console.log(path.dirname(path.join(__dirname, './bb.json')).split(path.sep));

//
// const {writeFileSync} = require('../utils');
//
// writeFileSync(require('path').join(__dirname, '../a/b/c.json'), JSON.stringify({a:1}));
// // OK


//
// global.CONFIG = require('../xman/potato_late_blight/config');
//
// console.log(CONFIG.get('cache'));

