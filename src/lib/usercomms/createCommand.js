import ackInteraction from "../../util/ackInteraction.js";
import {
    MessageComponentTypes,
    TextStyles,
} from "../../../deps.js";
import { usergameDB } from "./commandDB.js";

export function createCommand(bot, interaction) {
    const createOptions = interaction.data.options.filter(
	o => o.name == "create"
    )[0].options;

    const commandId = createOptions.filter(
	o => o.name == "command"
    )[0]["value"];

    bot.logger.debug(`Creating command for ${commandId}`);

    // Check if command name exists, if it does, complain
    // Otherwise present the modal

    const exists = usergameDB.searchCommand({name: commandId})

    if (exists.length != 0) {
	ackInteraction(
	    interaction,
	    "message",
	    {ephemeral: true},
	    {
		content: `Command with name ${commandId} already exists`
	    }
	);
    }else {
	let userId;
	if (interaction.member) {
	    userId = `${interaction.member.id}`;
	}else {
	    userId = `${interaction.user.id}`;
	}

	ackInteraction(
	    interaction,
	    "modal",
	    {ephemeral: true},
	    {
		// TODO: Actually get ID
		customId: `usergame_${userId}_src_create`,
		title: `${commandId}: Code Creation`,
		components: [{
		    type: MessageComponentTypes.ActionRow,
		    components: [{
			type: MessageComponentTypes.InputText,
			customId: `${commandId}`,
			style: TextStyles.Paragraph,
			label: "Source Code"
		    }]	
		}]
	    }
	);
    }
}
