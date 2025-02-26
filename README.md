# Server Management Bot for Discord

This bot allows users to manage and monitor Pterodactyl-based game servers directly from Discord. It provides features for automated server restarts, power control, and logging.

## Features
- Start, stop, and restart game servers from Discord.
- Automated server restarts based on player activity.
- Logging of all actions in a designated channel.
- Role-based permissions for server management.
- Scheduled checks to restart servers if they go offline.
- Embedded messages to display real-time server status.

## Installation
### Requirements
- Node.js
- A Pterodactyl panel with API access
- A Discord bot token
- A server with an open port for the web API

### Setup
1. Clone this repository.
2. Install dependencies using `npm install discord.js axios`.
3. Configure the bot by editing `config.json`:
   - Replace `YOUR_BOT_TOKEN_HERE`, `YOUR_GUILD_ID_HERE`, `YOUR_PANEL_URL_HERE/`, and `YOUR_PTERODACTYL_API_KEY_HERE` with your actual values.
   - Set your server IDs and log channel ID.
4. Run the bot using `node bot.js`.

## Configuration
- **Refresh Time**: Defines how often the bot checks for server updates.
- **Pterodactyl API**: The bot interacts with the Pterodactyl panel to control servers.
- **Role-Based Permissions**: Configure which roles can execute commands.
- **Scheduled Checks**: The bot can automatically restart a server if it detects downtime.

## Usage
- Use `/message` to retrieve the message ID for configuration.
- The bot will monitor and update server status in real-time.
- Admins can restart or stop servers using the configured commands.

## Security Considerations
- Never expose your bot token or API keys.
- Ensure that only trusted roles have access to management commands.
- Regularly update dependencies to prevent security vulnerabilities.

## License
This project is open-source and can be modified as needed.

