import {
    ApplicationCommandOptionTypes,
//    editOriginalInteractionResponse,
    sendMessage
} from "../../deps.js";
import { bot } from "../../bot.js";
import { addBotCommand } from "../lib/commands.js";
import ackInteraction from "../util/ackInteraction.js";

addBotCommand(bot, {
    description: "Play some fun games",
    name: "game",
    options: [{
	name: "Game",
	description: "Name of the game to play",
	type: ApplicationCommandOptionTypes.SubCommand,
	required: true,
	choices: [
	    "chess",
	    "hangman",
	    "test"
	]
    }],
    type: "slash",
    actions: [
	function (bot, interaction) {
	    ackInteraction(interaction);
	    sendMessage(bot, interaction.channelId, {content: interaction})
	}
    ]
})
