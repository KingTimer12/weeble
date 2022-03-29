const { SlashCommandBuilder } = require('@discordjs/builders');
const { gameDuo, gameInfinite, gameSolo } = require('../handler/gamehandler');

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
				gameSolo(interaction)
				return
			}
			const timestamp = dayjs().tz('America/Sao_Paulo').endOf('day').unix();
			await interaction.reply({
				content: `Você já jogou hoje! Tempo restante até a próxima palavra: <t:${timestamp}:R>`,
				ephemeral: true,
			});
		} else if (interaction.options.getSubcommand() == 'infinito') {
			gameInfinite(interaction)
		} else {
			if (await checkStatus(interaction.user.id, 'Duo') == false) {
				gameDuo(interaction)
				return
			}
			const timestamp = dayjs().tz('America/Sao_Paulo').endOf('day').unix();
			await interaction.reply({
				content: `Você já jogou o dueto hoje! Tempo restante até a próxima palavra: <t:${timestamp}:R>`,
				ephemeral: true,
			});
		}
	},
};