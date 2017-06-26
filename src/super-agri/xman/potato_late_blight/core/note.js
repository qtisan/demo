/**
 * Created by qtisa on 2017/6/25.
 */


function createNoteHandler(status, note) {
	return function (param, customer) {
		return {
			status: status,
			note: `${note}.source= ${param}`,
			customer: customer
		};
	};
}

module.exports = {

	interrupt: createNoteHandler('interrupt', 'wetness met 0s and interrupt..humid_array: '),

	out_of_growth: createNoteHandler('out_of_growth', 'it is now not in the growth..current_time: '),

	not_match: createNoteHandler('not_match', 'temperature not correct or time lasts haven\'t met the least..temp|last: '),

	solution_not_exist: createNoteHandler('solution_not_exist', 'solution not exist..site id: '),

	degree_0: createNoteHandler('degree_0', 'the degree match the solution is 0..temp|last: ')

};