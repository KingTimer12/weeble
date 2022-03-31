const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { letter } = require('../utils/emotes.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ajuda')
		.setDescription('Mostra como o jogo funciona'),
	async execute(interaction) {

		const embed = new MessageEmbed().setTitle('Como jogar?')
		.setDescription(`Utilize o comando /jogar e tente descobrir qual é o nome do personagem em **6 tentativas**!
		Ao enviar uma mensagem, os emojis mostraram o quão perto você está da\nresposta.\n\n**Exemplos:**`)
		.addField(
			`\u200B`, 
		`${letter['l']['green']}${letter['u']['gray']}${letter['c']['gray']}${letter['a']['gray']}${letter['s']['gray']}
		A letra ${letter['l']['green']} faz parte do nome e está na posição correta.`, false)
		.addField(
			`\u200B`, 
		`${letter['c']['gray']}${letter['h']['gray']}${letter['i']['gray']}${letter['k']['gray']}${letter['a']['yellow']}
		A letra ${letter['a']['yellow']} faz parte do nome, mas em outra posição.`, false)
		.addField(
			`\u200B`, 
		`${letter['t']['gray']}${letter['o']['gray']}${letter['o']['gray']}${letter['r']['gray']}${letter['u']['gray']}
		Nenhuma das letras faz parte do nome.`, false)
		.addField(
			`\u200B`, 
		`${letter['s']['green']}${letter['a']['green']}${letter['b']['green']}${letter['e']['green']}${letter['r']['green']}
		O nome foi encontrado, parabéns!`, false)
		.addField('\u200B', 'Os nomes podem apresentar letras repetidas.\nUm nome novo estará disponível todos os **dias**!', false)
		.setTimestamp()
		.setFooter({text: `Feito com ❤ por KingTimer12`, iconURL: `https://i.imgur.com/2YTURmO.png`})

		await interaction.reply({embeds: [embed]})

		/*await interaction.reply(`
            **Como jogar?**
Tente descobrir qual é o nome do personagem em **6 tentativas**!
Ao enviar uma mensagem, os emojis mostraram o quão perto você está
da resposta.
        
> Exemplos:

${letter['l']['green']}${letter['u']['gray']}${letter['c']['gray']}${letter['a']['gray']}${letter['s']['gray']}
A letra ${letter['l']['green']} faz parte do nome e está na posição correta.

${letter['c']['gray']}${letter['h']['gray']}${letter['i']['gray']}${letter['k']['gray']}${letter['a']['yellow']}
A letra ${letter['a']['yellow']} faz parte do nome, mas em outra posição.

${letter['t']['gray']}${letter['o']['gray']}${letter['o']['gray']}${letter['r']['gray']}${letter['u']['gray']}
Nenhuma das letras faz parte do nome.

${letter['s']['green']}${letter['a']['green']}${letter['b']['green']}${letter['e']['green']}${letter['r']['green']}
O nome foi encontrado, parabéns!
        
Os nomes podem apresentar letras repetidas.
Um nome novo estará disponível todos os dias!
        `);*/
	},
};