// Tired of having BigInts not serialize.
BigInt.prototype.toJSON = function() { return this.toString() }
// This file responsible for coordinating all other files and actually starting the bot
import { startBot, walkSync } from "./deps.js";
import { startWeb } from "./src/web/srv.js";
import { bot } from "./bot.js"; // bot instance

// Import all commands in commands directory
for (const file of walkSync("./src/commands/")) {
    if (file.isFile)
	if (file.name.endsWith(".js"))
	    import("./" + file.path);
}

// Start the bot
await startBot(bot);
await startWeb(8080);
