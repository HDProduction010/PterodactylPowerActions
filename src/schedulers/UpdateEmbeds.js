const Discord = require("discord.js");
const Nodeactyl = require("nodeactyl");
const settings = require("../../settings.json");
const { durationDeserializer } = require("../utils/time");

const nodeactylClient = new Nodeactyl.NodeactylClient(settings.ptero_baseurl, settings.ptero_apikey);
function formatNumber(num) {
    return num.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

module.exports = async(client) => {
    setInterval(async() => {
        for(const channelIdAndMessageId in settings.servers) {
            const channelId = channelIdAndMessageId.split("-")[0];
            const messageId = channelIdAndMessageId.split("-")[1];
            const serverId = settings.servers[channelIdAndMessageId];
            let limits, usage;

            try {
                limits = await nodeactylClient.getServerDetails(serverId);
                usage = await nodeactylClient.getServerUsages(serverId);
            } catch(error) {
                console.log("it broke at the API part :(");
                try {
                    const channel = await client.channels.cache.get(channelId);
                    const message = await channel.messages.fetch(messageId);

                    await message.edit({ content: null, embeds: [
                        new Discord.MessageEmbed()
                            .setColor("BLURPLE")
                            .setDescription("`THIS SERVER IS BEING REINSTALLED OR IS UNAVAILABLE.`")
                            .setTitle(`Server Manager | 🗃️ ID: ${serverId}`)
                    ], components: [
                        new Discord.MessageActionRow().addComponents(new Discord.MessageSelectMenu()
                            .setCustomId("power-action")
                            .setOptions(
                                { label: "Start Server", emoji: "🔌", value: "start" },
                                { label: "Restart Server", emoji: "⏯️", value: "restart" },
                                { label: "Stop Server", emoji: "⏱️", value: "stop" },
                                { label: "Kill Server", emoji: "🛠️", value: "kill" }
                            ).setPlaceholder("Power Actions")
                            .setMinValues(1)
                            .setMaxValues(1)
                            .setDisabled(true)
                        ), new Discord.MessageActionRow().addComponents(new Discord.MessageButton()
                            .setCustomId("send-command")
                            .setEmoji("⌨️")
                            .setLabel("Send Command")
                            .setStyle("SUCCESS")
                            .setDisabled(true),
                        )
                    ] });
                } catch(error) {
                console.log("it broke at the message part :(");

                }
                
                return;
            }

            try {
                const channel = await client.channels.cache.get(channelId);
                const message = await channel.messages.fetch(messageId);
                
                const emojis = {
                    "offline": "🔴🔴🔴",
                    "starting": "🟡🟡🟡",
                    "running": "🟢🟢🟢"
                };

                await message.edit({ content: null, embeds: [
                    new Discord.MessageEmbed()
                        .setColor("BLURPLE")
                        .setDescription(`
                            > **Server Details**
                            > Server Name: ${limits.name}
                            > Docker Image: ${limits.docker_image}
                            > IP Address: ${limits.relationships.allocations.data[0].attributes.ip}:${limits.relationships.allocations.data[0].attributes.port}
                            
                            ${
                                usage.current_state != 'offline' ?
                                `> **Resource Usage**
                                > Memory: ${formatNumber((usage.resources.memory_bytes/1024/1024).toFixed(2))}MB / ${formatNumber((limits.limits.memory).toFixed(2)).toLocaleUpperCase()}MB
                                > Disk: ${formatNumber((usage.resources.disk_bytes/1024/1024).toFixed(2))}MB / ${(limits.limits.disk).toFixed(2) != 0 ? formatNumber((limits.limits.disk).toFixed(2)) + 'MB' : 'inf'}
                                > CPU: ${usage.resources.cpu_absolute.toFixed(2)}% / ${limits.limits.cpu.toFixed(2) != 0 ? limits.limits.cpu.toFixed(2) + '%' : 'inf'}
                                \`\`\`/ / / / / / / / / /   D A N G E R   / / / / / / / / / /\n\n${limits.name}\n--------------------\n  START    [Force startup if crash auto-start fails]\n  RESTART  [Force server update if available]\n  STOP\n  KILL\n\nNo safeguard checks; do not use on live server unless\nexcept for server update or emergency-use.\n\n/ / / / / / / / / /   D A N G E R   / / / / / / / / / /\n\`\`\`
                                `
                                : `\`SERVER OFFLINE\``
                            }`)
                        .setTitle(`\`\`/   ${limits.name}   /   ${durationDeserializer(usage.resources.uptime/1000)}   /\`\``)
                        .setAuthor({ name: `REMOTE SERVER PANEL    |    ${emojis[usage.current_state]}`})
                        .setTimestamp(Date.now())
                ], components: [
                    new Discord.MessageActionRow().addComponents(new Discord.MessageSelectMenu()
                        .setCustomId("power-action")
                        .setOptions(
                            { label: "Start Server", emoji: "🔌", value: "start" },
                            { label: "Restart Server", emoji: "⏯️", value: "restart" },
                            { label: "Stop Server", emoji: "⏱️", value: "stop" },
                            { label: "Kill Server", emoji: "🛠️", value: "kill" }
                        ).setPlaceholder("Power Actions")
                        .setMinValues(1)
                        .setMaxValues(1)
                    ), new Discord.MessageActionRow().addComponents(new Discord.MessageButton()
                        .setCustomId("send-command")
                        .setEmoji("⌨️")
                        .setLabel("Send Command")
                        .setStyle("SUCCESS"),
                    )
                ] });
            } catch(error) {
                console.log(error);
                console.log("it broke at the second message part :(");
            }
        }
    }, settings.refresh_time * 10000);
};