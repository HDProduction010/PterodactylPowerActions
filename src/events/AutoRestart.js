const Nodeactyl = require('nodeactyl');
const axios = require('axios');
const settings = require("../../settings.json");
const serverId1 = settings.serverid1
const serverId2 = settings.serverid2
const minUptimeThreshold = settings.minthresholdpower
const maxPlayerCount = 5;
const battleMetricsServerId = 'enterbmserverid';
const battleMetricsApiKey = 'enterbmtokenhere';
const nodeactylClient = new Nodeactyl.NodeactylClient(settings.ptero_baseurl, settings.ptero_apikey);
const { MessageEmbed } = require("discord.js");
const Discord = require("discord.js");


function formatDuration(ms) { 
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  return `${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}


async function checkServerStatus() {
  try {
    // get server information
    const limits1 = await nodeactylClient.getServerDetails(serverId1);
    const limits2 = await nodeactylClient.getServerDetails(serverId2);
    let usage1 = await nodeactylClient.getServerUsages(serverId1);
    let usage2 = await nodeactylClient.getServerUsages(serverId2);

    // check server status
    if (usage1.current_state !== 'offline') {
      // calculate server uptime in milliseconds
      const uptime = usage1.resources.uptime;

      // check if the server uptime exceeds the minimum threshold
      if (uptime >= minUptimeThreshold) {
        console.log('Server has reached the minimum uptime threshold.');

        // start checking player count
        await checkPlayerCount(limits1, usage1, limits2, usage2);
      } else {
        console.log(`Server uptime is below the minimum threshold. ${formatDuration(minUptimeThreshold)}`);
        console.log(`Current Uptime: ${formatDuration(uptime)}`);
      }
    } else {
      console.log('Server is currently offline.');
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

async function checkPlayerCount(limits1, usage1, limits2, usage2) {
  try {
    const response = await axios.get(`https://api.battlemetrics.com/servers/${battleMetricsServerId}`, {
      headers: {
        Authorization: `Bearer ${battleMetricsApiKey}`,
      },
    });

    // get the player count from the BattleMetrics API response
    const playerCount = response.data.data.attributes.players;

    // check if the player count is less than the maximum allowed
    if (playerCount < maxPlayerCount) {
      console.log(`Player count (${playerCount}) is less than ${maxPlayerCount}. Restarting server...`);

      // send restart power action to the servers
      await nodeactylClient.killServer(serverId1);
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await nodeactylClient.restartServer(serverId1);
      await new Promise((resolve) => setTimeout(resolve, 10000));
      await nodeactylClient.restartServer(serverId2);

      const client = new Discord.Client({ intents: [
        Discord.Intents.FLAGS.GUILDS, 
        Discord.Intents.FLAGS.GUILD_MEMBERS, 
        Discord.Intents.FLAGS.GUILD_MESSAGES, 
        Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      ],
      partials: [
        "CHANNEL",
        "REACTION",
        "GUILD_MEMBER",
        "MESSAGE",
        "REACTION",
        "USER"
      ]
      });

      client.once('ready', () => {});

      client.on('error', (error) => {
        console.error('Discord bot error:', error);
      });

      client.login(settings.bot_token);

      client.on('ready', () => {
        const logEmbed = new MessageEmbed()
          .setColor("RED")
          .setAuthor({ name: 'REMOTE SERVER PANEL    |    Server Action Command',      })
          .setTitle(`AUTOMATIC SERVER RESTART`)
          .setDescription(`> \` ${limits1.name} \` \n> \` ${limits2.name} \` \n\n> Server up-time: \` ${formatDuration(usage1.resources.uptime)} \` \n> Player-count: \` ${playerCount} \` \n\nActivated by \`Server Automation\``)
          .setTimestamp();
        if (client && client.channels && client.channels.cache) {
          const logChannel = client.channels.cache.get("1161155656389251135");

          if (logChannel) {
            logChannel.send({ embeds: [logEmbed] });
          } else {
            console.log('Log channel not found.');
          }
        } else {
          console.log('Invalid client object.');
        }
      });
    } else {
      console.log(`Player count (${playerCount}) is equal to or exceeds ${maxPlayerCount}. Not restarting.`);
    }
  } catch (error) {
    console.error('An error occurred while checking player count:', error);
  }
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

(async () => {
  try {
    while (true) {
      await checkServerStatus();

      // wait for 60 seconds before checking the server status again
      await delay(30 * 1000);
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
})();
