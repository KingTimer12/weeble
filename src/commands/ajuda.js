const { SlashCommandBuilder } = require('@discordjs/builders');
const { letter } = require('../utils/emotes.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ajuda')
		.setDescription('Mostra como o jogo funciona'),
	async execute(interaction) {
		await interaction.reply(`
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
        `);
	},
};