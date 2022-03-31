const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

module.exports = {
	loopReset(callback) {
		setInterval(() => {
			const braziliamTime = dayjs().tz('America/Sao_Paulo').format('HH:mm');
			if (braziliamTime === '08:27') {
                callback()
			}
		}, 60_000);
	},
};