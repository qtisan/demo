
const { Growth } = require('../core');

// TODO: load the growth collection from database.

module.exports = () => [
	new Growth({
		site_id: '108873827',
		seasons: [[
			{name: '芽条生长期', time: '20170311-20170404'},
			{name: '幼苗期', time: '20170409-20170424'},
			{name: '块茎形成期', time: '20170501-20170515'},
			{name: '块茎增长期', time: '20170518-20170524'},
			{name: '淀粉积累期', time: '20170528-20170611'},
			{name: '成熟收获期', time: '20170615-20170620'}
		], [
			{name: '芽条生长期', time: '20170711-20170804'},
			{name: '幼苗期', time: '20170809-20170829'},
			{name: '块茎形成期', time: '20170902-20170912'},
			{name: '块茎增长期', time: '20170916-20170920'},
			{name: '淀粉积累期', time: '20170925-20171009'},
			{name: '成熟收获期', time: '20171022-20171120'}
		]]
	}, '20170617'),
	new Growth({
		site_id: '109384773',
		seasons: [[
			{name: '芽条生长期', time: '20170311-20170404'},
			{name: '幼苗期', time: '20170409-20170424'},
			{name: '块茎形成期', time: '20170501-20170515'},
			{name: '块茎增长期', time: '20170518-20170524'},
			{name: '淀粉积累期', time: '20170528-20170611'},
			{name: '成熟收获期', time: '20170615-20170620'}
		], [
			{name: '芽条生长期', time: '20170711-20170804'},
			{name: '幼苗期', time: '20170809-20170829'},
			{name: '块茎形成期', time: '20170902-20170912'},
			{name: '块茎增长期', time: '20170916-20170920'},
			{name: '淀粉积累期', time: '20170925-20171009'},
			{name: '成熟收获期', time: '20171022-20171120'}
		]]
	}, '20170620')
];