/**
 * Created by qtisa on 2017/6/20.
 */


process.on('message', function (message) {
	console.log(`this === process: ${this === process}, pid: ${this.pid}`);
	if (message.command == 'goon') {
		this.send({status: 'ok'});
	}
	else {
		this.send({m: 'world!'});
	}
});
