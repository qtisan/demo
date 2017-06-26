/**
 * Created by qtisa on 2017/6/26.
 */

module.exports = {

	db: {
		driver: 'oracle',
		config: {
			user: 'terminator',
			password: 'terminator',
			connectString: '139.224.226.82:1521/orcl',
			pool: true,

			options: {
				
				maxRows: 1000
			}
		}
	}

};