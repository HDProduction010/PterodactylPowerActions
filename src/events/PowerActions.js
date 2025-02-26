const Nodeactyl = require("nodeactyl");
const settings = require("../../settings.json");
const { MessageEmbed } = require("discord.js");

const nodeactylClient = new Nodeactyl.NodeactylClient(settings.ptero_baseurl, settings.ptero_apikey);

module.exports = {
    eventName: "interactionCreate",
    run: async(client, interaction) => {
        if (!interaction.isSelectMenu() || interaction.customId != "power-action") return;

        const serverId = settings.servers[interaction.channel.id + "-" + interaction.message.id];
        limits = await nodeactylClient.getServerDetails(serverId);

        // Define an object mapping roles to commands they are allowed to execute, using role IDs as keys
        const rolePermissions = {
            "": ["start", "restart", "stop", "kill"], // Retro
            "": ["start", "restart"], // Admin
            "": ["start", "restart"], // Junior
            "": [] // Empty string not allowed to execute any commands
        };

        // Check if the user invoking the command has one of the allowed roles
        const allowedRoles = rolePermissions[interaction.member.roles.cache.find(r => rolePermissions[r.id])?.id || ""];
        if (!allowedRoles.includes(interaction.values[0])) {
            return interaction.reply({ content: "INVALID PERMISSION; command has failed to initialize.", ephemeral: true });
        }

        const messages = {
            "start": "Sever command initialized: `START`.",
            "restart": "Server command initialized: `RESTART`",
            "stop": "Server command initialized: `STOP`",
            "kill": "Server command initialized: `KILL`",
        }

        const action = interaction.values[0];

        switch (action) {
            case "start": {
                await nodeactylClient.startServer(serverId);
                break;
            } case "restart": {
                await nodeactylClient.restartServer(serverId);
                break;
            } case "stop": {
                await nodeactylClient.stopServer(serverId);
                break;
            } case "kill": {
                await nodeactylClient.killServer(serverId);
                break;
            } default: {
                break;
            }
        }

        const logEmbed = new MessageEmbed()
        .setColor("RED")
        .setTitle(`MANUAL SERVER ACTION`)
        .setAuthor({ name: 'REMOTE SERVER PANEL    |    Server Action Command',      })
        .setDescription(`> \` ${limits.name} \` \n> Server command: \` ${action} \` \n\nActivated by \`${interaction.user.tag}\``)
        .setTimestamp();

        const logChannel = interaction.guild.channels.cache.get(""); // Replace with the ID of the channel you want to log to

        if(logChannel) {
            logChannel.send({ embeds: [logEmbed] });
        } else {
            console.log(`Log channel not found for command: ${action}`);
        }

        await interaction.reply({ content: messages[action], ephemeral: true });
        }
    }