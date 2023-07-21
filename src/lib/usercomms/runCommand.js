import ackInteraction from "../../util/ackInteraction.js";
import {
    editOriginalInteractionResponse
} from "../../../deps.js";
import { usergameDB } from "./commandDB.js";

export async function runCommand(bot, interaction) {
    const createOptions = interaction.data.options.filter(
	o => o.name == "run"
    )[0].options;

    const commandId = createOptions.filter(
	o => o.name == "command"
    )[0]["value"];

    bot.logger.debug(`Running command ${commandId}`);

    const exists = usergameDB.searchCommand({name: commandId})

    if (exists.length == 0) {
	ackInteraction(
	    interaction,
	    "message",
	    {ephemeral: true},
	    {
		content: `Command with name ${commandId} does not exist!`
	    }
	);
    }else {
	ackInteraction(
	    interaction,
	    "thinking",
	    {ephemeral: true}
	);
	const output = await usergameDB.runCommand(commandId);
	editOriginalInteractionResponse(bot, interaction.token, {
	    content: output.slice(0,2000)
	});
    }
    return
}