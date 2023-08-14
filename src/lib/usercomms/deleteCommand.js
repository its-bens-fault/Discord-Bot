import ackInteraction from "../../util/ackInteraction.js";
import {
} from "../../../deps.js";
import { usergameDB } from "./commandDB.js";

export function deleteCommand(bot, interaction) {
    const createOptions = interaction.data.options.filter(
	o => o.name == "delete"
    )[0].options;

    const commandId = createOptions.filter(
	o => o.name == "command"
    )[0]["value"];

    bot.logger.debug(`Deleting command ${commandId}`);

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
	const commandUserId = exists[0][1];
	let userId;
	if (interaction.member) {
	    userId = `${interaction.member.id}`;
	}else {
	    userId = `${interaction.user.id}`;
	}
	if (userId == commandUserId) {
	    usergameDB.deleteCommand(userId, commandId);
	    ackInteraction(
		interaction,
		"message",
		{ephemeral: true},
		{
		    content: `Deleted ${commandId}`
		}
	    );
	}else {
	    bot.logger.debug(`User ${userId} tried to modify ${commandUserId}'s command`);

	    ackInteraction(
		interaction,
		"message",
		{ephemeral: true},
		{
		    content: `You did not make ${commandId}`
		}
	    );
	}
    }
    return
}
