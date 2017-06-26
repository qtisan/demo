/**
 * Created by qtisa on 2017/6/24.
 */
//
// const {XPLBLogger} = require('../utils');
//
// const num = 10000000;
// let f = [], i = num, j = num*100, c = 0;
// while(i--) {
// 	f.push(i*8);
// }
// XPLBLogger.start('foreach');
// f.forEach(n => {
// 	n.res = n*39487548;
// 	if (++c == num) {
// 		XPLBLogger.debug('f is now finished!');
// 	}
// 	cb();
// });
// XPLBLogger.debug('is f finished ?');
// XPLBLogger.end('foreach');
//
// function cb () {
// 	while (j--) {
// 		f[j] += j;
// 	}
// }
//
//
// // FATAL ERROR: invalid table size Allocation failed - JavaScript heap out of memory

//
// class A {
// 	constructor (name) {
// 		this.name = name;
// 	}
// 	clone () {
// 		const that = new A();
// 		Object.assign(that, this);
// 		return that;
// 	}
// }
//
// class AA extends A {
// 	constructor ({name, age, house}) {
// 		super(name);
// 		this.age = age;
// 		this.house = house;
// 	}
// 	clone () {
// 		return new AA(this);
// 	}
//  	say () {
// 		console.log(`hello, ${this.name}. your age is ${this.age}. house area: ${this.house.area}`);
// 	}
// }
//
// const a = new AA({name: 'lennon', age: 32, house: { area: 69 }});
// const b = a.clone();
// a.say();
// b.say();
// a.house.area = 102;
// a.age = 55;
// a.name = 'jacky';
// b.say();
// a.say();



const note = require('../xman/potato_late_blight/core/note');
console.log(Object.assign({}, {a:1}, note['interrupt'](11111)));

