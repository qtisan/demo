
// TODO: read solution collection from database.

const { Solution } = require('../core');

module.exports = () => [
	new Solution({
		site_id: '103394883',
		solution_id: '102983', // 方案编号
		humid_bound: 90, // 符合条件的最小湿度
		humid_interrupt: 5, // 湿度不符合条件的中断小时数
		last_least: 10.5, // 符合计算条件的最小持续时长
		infect_solution: { // 侵染方案参数，平均温度: [轻, 中, 重, 极重]
			'7':  [16.5, 19.5, 22.5, 25.5],
			'8':  [16.0, 19.0, 22.0, 25.0],
			'9':  [15.5, 18.5, 21.5, 24.5],
			'10': [15.0, 18.0, 21.0, 24.0],
			'11': [14.0, 17.5, 20.5, 23.5],
			'12': [13.5, 17.0, 19.5, 22.5],
			'13': [13.0, 16.0, 19.0, 21.5],
			'14': [12.5, 15.0, 18.0, 21.0],
			'15': [10.5, 14.0, 17.0, 20.0],
			'16': [13.0, 13.0, 16.0, 19.0],
			'17': [12.0, 12.0, 15.0, 18.0],
			'18': [11.0, 11.0, 14.0, 17.0]
		},
		score_solution: [ // 积分方案参数，[[日均温度, 增加积分]...]
			[8, 0], [12, 0.75], [16.5, 1], [20, 1.5], [99, 1]
		]
	})
];
