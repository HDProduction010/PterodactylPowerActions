const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    commandData: new SlashCommandBuilder()
        .setName("message")
        .setDescription("Send a message to use for the settings.json of this bot.")
        .toJSON(),
    
    run: async(client, interaction) => {
        const message = await interaction.channel.send("hello world");
        await interaction.reply({ content: `channel id: ${message.channel.id}\nmessage id: ${message.id}`, ephemeral: true });
    }
}