const Discord = require("discord.js");
const Nodeactyl = require("nodeactyl");
const settings = require("../../settings.json");

const nodeactylClient = new Nodeactyl.NodeactylClient(settings.ptero_baseurl, settings.ptero_apikey);

const awaitingResponses = [];

module.exports = {
    eventName: "interactionCreate",
    run: async(client, interaction) => {
        const requiredRoleId = ""; // replace with the actual role ID required to run the command
            if(!interaction.isButton() || interaction.customId != "send-command") return;
            if (interaction.member.roles.cache.has(requiredRoleId)) {
            const serverId = settings.servers[interaction.channel.id + "-" + interaction.message.id];

            const form = new Discord.Modal();
            form.setTitle("Send a command to the server.");
            form.setCustomId("send-command-form");
            form.setComponents(
                new Discord.MessageActionRow().setComponents(
                    new Discord.TextInputComponent()
                        .setCustomId("command")
                        .setLabel("Command")
                        .setPlaceholder("If your HD please don't break the server")
                        .setStyle("SHORT")
                        .setRequired(true)
                )
            );

            const filter = (checkInteraction) => 
                interaction.member.id == checkInteraction.member.id
                && checkInteraction.customId == "send-command-form";

            await interaction.showModal(form);
            if(!awaitingResponses.includes(interaction.member.id)) {
                awaitingResponses.push(interaction.member.id);

                interaction.awaitModalSubmit({ filter, time: 30_000 }).then(async(modalInteraction) => {
                    const command = modalInteraction.fields.getTextInputValue("command");
                    await nodeactylClient.sendServerCommand(serverId, command);
                    await modalInteraction.reply({ content: `I sent the command \`${command}\` to this server's console!`, ephemeral: true });

                    awaitingResponses.splice(awaitingResponses.indexOf(interaction.member.id), 1);
                }).catch(async(error) => {
                    await interaction.followUp({ content: "You took too long to fill out the form!", ephemeral: true });
                    awaitingResponses.splice(awaitingResponses.indexOf(interaction.member.id), 1);
                });
            }
        } else {
            await interaction.reply({ content: "You do not have permission to run this.", ephemeral: true }); // return error message if user doesn't have the required role
        }
    }
}