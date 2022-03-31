const { SlashCommandBuilder } = require('@discordjs/builders');

const { checkStatus } = require('../handler/databasehandler');
const { gameDuo, gameInfinite, gameSolo, game } = require('../handler/gamehandler');

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('jogar')
		.setDescription('Iniciar o jogo')
		.addSubcommand(subcommand =>
			subcommand
			.setName('diário')
			.setDescription('Descubra o nome do dia!'))
		.addSubcommand(subcommand =>
			subcommand
			.setName('infinito')
			.setDescription('Faça o máximo de pontos!'))
		.addSubcommand(subcommand =>
			subcommand
			.setName('duo')
			.setDescription('O dobro do perigo!')),
	async execute(interaction) {
		if (interaction.options.getSubcommand() == 'diário') {
			if (await checkStatus(interaction.user.id, 'Solo') == false) {
				await game(interaction, 'Solo')
				return
			}
			const timestamp = dayjs().tz('America/Sao_Paulo').endOf('day').unix();
			await interaction.reply({
				content: `<t:${timestamp}:R> você poderá jogar novamente.`,
				ephemeral: true,
			});
		} else if (interaction.options.getSubcommand() == 'infinito') {
			await game(interaction, 'Infinite')
		} else {
			if (await checkStatus(interaction.user.id, 'Duo') == false) {
				await game(interaction, 'Duo')
				return
			}
			const timestamp = dayjs().tz('America/Sao_Paulo').endOf('day').unix();
			await interaction.reply({
				content: `<t:${timestamp}:R> você poderá jogar novamente.`,
				ephemeral: true,
			});
		}
	},
};