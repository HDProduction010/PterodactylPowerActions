const axios = require('axios');

module.exports = (client) => {
    const settings = client.settings;
    const serverIds = [""];  // The two servers you want to monitor

    setInterval(async () => {
        for (const serverId of serverIds) {
            try {
                const response = await axios.get(`${settings.ptero_baseurl}api/client/servers/${serverId}/resources`, {
                    headers: {
                        'Authorization': `Bearer ${settings.ptero_apikey}`,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                });

                const status = response.data.attributes.current_state;
                console.log(`Server ${serverId} is currently: ${status}`);

                if (status === 'offline') {
                    console.log(`Starting server ${serverId}...`);
                    await startServer(serverId, client);
                } else {
                    console.log(`Server ${serverId} is running fine.`);
                }
            } catch (error) {
                console.error(`Error checking status of server ${serverId}:`, error.message);
            }
        }
    }, settings.refresh_time * 1000); // refresh_time in seconds, convert to milliseconds

    // Function to start a server
    async function startServer(serverId, client) {
        try {
            await axios.post(`${settings.ptero_baseurl}api/client/servers/${serverId}/power`, {
                signal: 'start',
            }, {
                headers: {
                    'Authorization': `Bearer ${settings.ptero_apikey}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            const logChannel = client.channels.cache.get(settings['log-channel']);
            if (logChannel) {
                logChannel.send(`Server ${serverId} was offline and has been started.`);
            }

            console.log(`Server ${serverId} has been started.`);
        } catch (error) {
            console.error(`Error starting server ${serverId}:`, error.message);
        }
    }
};
