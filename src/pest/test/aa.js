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




const {fork} = require('child_process');
const join = require('path').join;

const children = [];
let i = 3;
while (i--) {
	let child = fork(join(__dirname, './bb.js'));
	children.push(child);
	child.on('message', function (data) {
		console.log(data);
		console.log(`this === child: ${this === child}, pid: ${this.pid}`);
		((s)=>{s.f();})({f: () => {console.log(this.pid)}});
		this.send({command: 'goon'});
		if (data.status == 'ok') {
			console.log('not halt.');
		}
	});
}

children.forEach(child => child.send('hello'));

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










