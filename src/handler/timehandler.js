const {generateWord} = require('./databasehandler.js')
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

module.exports = {
	loopReset() {
		setInterval(() => {
			const braziliamTime = dayjs().tz('America/Sao_Paulo').format('HH:mm');
			if (braziliamTime === '00:00') {
				generateWord();
			}
		}, 60_000);
	},
};