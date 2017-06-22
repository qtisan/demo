/**
 * Created by qtisa on 2017/6/22.
 */
//
// class A {
// 	constructor () {
// 		this.x = 1;
// 	}
// 	skip () {
// 		return new AA(this.x);
// 	}
// }
//
// class AA extends A{
// 	constructor (v) {
// 		super();
// 		this.x = v;
// 	}
// }
//
// let a = new AA(5);
// console.log(a.skip().x);
//
//
// const {logger, createWriteStream} = require('../utils');
// process.stdout = createWriteStream(require('path').join(__dirname, './log.out'), {flags: 'w', defaultEncoding: 'utf8'});
// 	logger.info('hello!');
// //
// // internal/fs.js:20
// // throw new Error(`Unknown encoding: ${encoding}`);
// // ^
// //
// // Error: Unknown encoding: d:\projects\demo\src\pest\test\log.out
// // at assertEncoding (internal/fs.js:20:11)
// // at getOptions (fs.js:58:5)
// // at new WriteStream (fs.js:1988:24)
// // at fs.createWriteStream (fs.js:1979:10)
// // at Object.apply (d:\projects\demo\src\pest\utils.js:84:19)
// // at Object.<anonymous> (d:\projects\demo\src\pest\test\cc.js:26:18)
// // at Module._compile (module.js:571:32)
// // at Object.Module._extensions..js (module.js:580:10)
// // at Module.load (module.js:488:32)
// // at tryModuleLoad (module.js:447:12)


//
// const {logger, createWriteStream} = require('../utils');
// const {Console} = require('console');
// const console = new Console(createWriteStream(require('path').join(__dirname, './log.out')), {
// 	flags: 'a',
// 	defaultEncoding: 'utf8',
// 	fd: null,
// 	mode: 0o666,
// 	autoClose: true
// });
//
// console.info('hello!');
//
// //
// // console.js:15
// // throw new TypeError('Console expects writable stream instances');
// // ^
// //
// // TypeError: Console expects writable stream instances
// // at new Console (console.js:15:11)
// // at Object.<anonymous> (d:\projects\demo\src\pest\test\cc.js:49:17)
// // at Module._compile (module.js:571:32)
// // at Object.Module._extensions..js (module.js:580:10)
// // at Module.load (module.js:488:32)
// // at tryModuleLoad (module.js:447:12)
// // at Function.Module._load (module.js:439:3)
// // at Module.runMain (module.js:605:10)
// // at run (bootstrap_node.js:427:7)
// // at startup (bootstrap_node.js:151:9)


//
// const log4js = require('log4js');
// const logPattern = '[%c][%p] - %m %n----pid:%z, time:%r';
// log4js.loadAppender('dateFile');
// log4js.addAppender(log4js.appenders.dateFile('./cheese.log', logPattern, ), 'cheese');
// log4js.addAppender(log4js.appenders.dateFile('./cake.log', logPattern, ), 'cake');
//
// const lo1 = log4js.getLogger('cheese');
// const lo2 = log4js.getLogger('cake');
//
// lo1.info('ch111111111111');
// lo2.info('ccccccccccccccccc');
//


//
// const {join: j} = require('path');
//
// console.log(j(__dirname, './f'));
//

const {XPLBLogger: logger} = require('../utils');

logger.info('hello, world!');












