/**
 * Created by qtisa on 2017/6/28.
 */

const keymap = function (item) {
	return {
		time: item['000'],
		phe: item['001'],
		temp: item['002'],
		wind: item['003'],
		windy: item['004'],
		humid: item['005'],
		fall: item['006'],
		press: item['007']
	};
};

const keymapList = function (list) {
	const result = [];
	list.forEach(i => {
		result.push(keymap(i));
	});
	return result;
};

module.exports = { keymap, keymapList };

